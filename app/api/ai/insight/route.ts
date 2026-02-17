import { NextRequest, NextResponse } from 'next/server';
import { getGeminiDeepInsight } from '@/lib/gemini';
import { marketData } from '@/lib/api';
import { getCachedAIResponse, setCachedAIResponse } from '@/lib/cache';

// GET endpoint for async client-side loading with streaming support
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol');
        const rsi = Number(searchParams.get('rsi')) || 50;
        const stream = searchParams.get('stream') === 'true';

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        const cacheKey = `deep-insight-${symbol}-${rsi.toFixed(0)}`;

        // If not streaming or cache exists, return cached/normal response
        if (!stream) {
            const cached = await getCachedAIResponse(cacheKey);
            if (cached) {
                return NextResponse.json({ insight: cached, cached: true });
            }
        }

        // Fetch fresh data for the insight
        const [quote, history] = await Promise.all([
            marketData.getQuote(symbol),
            marketData.getHistoricalData(symbol, '3mo')
        ]);

        if (!quote || !history) {
            return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 404 });
        }

        // Fetch symbol-specific news for grounded insights
        const newsContext = await marketData.getNews(`${symbol} stock news`);

        // If streaming is requested, return streaming response
        if (stream) {
            const encoder = new TextEncoder();
            const customStream = new ReadableStream({
                async start(controller) {
                    try {
                        // Use Gemini's streaming API for true word-by-word streaming
                        const { GoogleGenerativeAI } = await import('@google/generative-ai');
                        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                        // Calculate summary stats instead of sending full history
                        const recent30 = history.slice(-30);
                        const priceChange30d = recent30.length > 0
                            ? ((recent30[recent30.length - 1].close - recent30[0].close) / recent30[0].close * 100).toFixed(2)
                            : 0;
                        const high30d = Math.max(...recent30.map(d => d.high));
                        const low30d = Math.min(...recent30.map(d => d.low));
                        const avgVolume = recent30.reduce((sum, d) => sum + d.volume, 0) / recent30.length;

                        // Build optimized prompt
                        const prompt = `
                            You are a Lead Equity Analyst at a Global Hedge Fund with 15+ years of experience.
                            Provide an institutional-grade deep analysis of ${symbol}.
                            
                            ASSET DATA:
                            - Symbol: ${symbol}
                            - Current Price: $${quote.regularMarketPrice || quote.price || 'N/A'}
                            - Market Cap: $${quote.marketCap ? (quote.marketCap / 1e9).toFixed(2) : 'N/A'}B
                            - 30-Day Performance: ${priceChange30d}%
                            - 30-Day Range: $${low30d.toFixed(2)} - $${high30d.toFixed(2)}
                            - Avg Volume (30d): ${(avgVolume / 1e6).toFixed(2)}M
                            - RSI: ${rsi}
                            
                            ${newsContext ? `RECENT NEWS:\n${newsContext.slice(0, 400)}\n` : ''}
                            
                            CRITICAL: Return ONLY a JSON object with this EXACT field order (convictionExplanation MUST be first for streaming):
                            {
                                "convictionExplanation": "2-3 sentences with SPECIFIC evidence: institutional ownership changes, analyst actions, options flow, insider trades, or price action with exact numbers/dates",
                                "narrative": "4-5 sentences covering: current price action, news impact, support/resistance levels, upside/downside targets, and key risks. Be specific with numbers.",
                                "volatilityRegime": "Stable" | "Trending" | "Chaotic",
                                "alphaScore": number (0-100),
                                "institutionalConviction": "High" | "Medium" | "Low",
                                "macroContext": "1-2 sentences on market conditions impact",
                                "riskRewardRatio": "e.g., 1:2.4"
                            }
                        `;

                        // Stream the response chunk by chunk
                        const result = await model.generateContentStream(prompt);
                        let fullText = '';

                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            fullText += chunkText;

                            // Send each chunk as it arrives
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText, complete: false })}\n\n`));
                        }

                        // Parse the complete response
                        const cleanedText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                        const insight = JSON.parse(cleanedText);

                        // Send final complete message
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ insight, complete: true })}\n\n`));

                        // Cache the result
                        await setCachedAIResponse(cacheKey, insight);
                        controller.close();
                    } catch (error) {
                        console.error('Streaming error:', error);
                        controller.error(error);
                    }
                }
            });

            return new Response(customStream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // Non-streaming response
        const insight = await getGeminiDeepInsight(symbol, history, quote, rsi, newsContext);
        await setCachedAIResponse(cacheKey, insight);
        return NextResponse.json({ insight });
    } catch (error) {
        console.error("AI Insight GET API Error:", error);
        return NextResponse.json({
            error: 'Failed to generate AI insight',
            details: String(error)
        }, { status: 500 });
    }
}

// POST endpoint for server-side rendering (legacy support)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbol, history, quote, rsi } = body;

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        const cacheKey = `deep-insight-${symbol}-${rsi?.toFixed(0) || '0'}`;
        const cached = await getCachedAIResponse(cacheKey);
        if (cached) {
            return NextResponse.json({ ...cached, cached: true });
        }

        // Fetch symbol-specific news for grounded insights
        const newsContext = await marketData.getNews(symbol);
        const insight = await getGeminiDeepInsight(symbol, history, quote, rsi, newsContext);

        await setCachedAIResponse(cacheKey, insight);
        return NextResponse.json(insight);
    } catch (error) {
        console.error("AI Insight POST API Error:", error);
        return NextResponse.json({ error: 'Failed to generate AI insight', details: String(error) }, { status: 500 });
    }
}

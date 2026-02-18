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
        // Standard non-streaming response for all requests
        const insight = await getGeminiDeepInsight(symbol, history, quote, rsi, newsContext || undefined);
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

import { NextRequest, NextResponse } from 'next/server';
import { getMarketNarrative } from '@/lib/gemini';
import { marketData } from '@/lib/api';
import { getCachedAIResponse, setCachedAIResponse } from '@/lib/cache';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const netWorth = Number(searchParams.get('netWorth')) || 0;
    const distributionStr = searchParams.get('distribution') || '{}';
    const stream = searchParams.get('stream') === 'true';

    let distribution = {};
    try {
        distribution = JSON.parse(distributionStr);
    } catch (e) {
        console.error("Failed to parse distribution", e);
    }

    const cacheKey = `market-narrative-${netWorth}-${JSON.stringify(distribution).length}`;

    // If not streaming, check cache
    if (!stream) {
        const cached = await getCachedAIResponse<string>(cacheKey);
        if (cached) {
            return NextResponse.json({ narrative: cached, cached: true });
        }
    }

    try {
        // Fetch general market news for top-level narrative
        const marketNews = await marketData.getNews("S&P 500 market sentiment");

        // If streaming is requested, return streaming response
        if (stream) {
            const encoder = new TextEncoder();
            const customStream = new ReadableStream({
                async start(controller) {
                    try {
                        const narrative = await getMarketNarrative(netWorth, distribution, marketNews);

                        // Stream the response
                        const data = JSON.stringify({ narrative });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

                        // Cache the result
                        await setCachedAIResponse(cacheKey, narrative);
                        controller.close();
                    } catch (error) {
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
        const narrative = await getMarketNarrative(netWorth, distribution, marketNews);
        await setCachedAIResponse(cacheKey, narrative);
        return NextResponse.json({ narrative });
    } catch (error) {
        console.error("Market Narrative API Error:", error);
        return NextResponse.json({
            narrative: "Market conditions remain stable with institutional concentration in core indices.",
            error: String(error)
        }, { status: 500 });
    }
}

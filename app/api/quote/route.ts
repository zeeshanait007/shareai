import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance, marketData } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const range = searchParams.get('range'); // '1d', '5d', '1mo', 'ytd', '1y', 'max'

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // If range is provided and NOT '1d', fetch historical data
        if (range && range !== '1d') {
            const history = await marketData.getHistoricalData(symbol, range);

            if (!history || history.length < 2) {
                // Fallback to regular quote if no history
                const quote = await yahooFinance.quote(symbol);
                return NextResponse.json(quote);
            }

            const startPrice = history[0].close; // Close price of the first available day in range
            const currentPrice = history[history.length - 1].close; // Latest close

            // Calculate percentage change
            const changePercent = ((currentPrice - startPrice) / startPrice) * 100;
            const changeValue = currentPrice - startPrice;

            // Get regular quote for other metadata (name, etc)
            const quote = await yahooFinance.quote(symbol);

            return NextResponse.json({
                ...quote,
                periodChangePercent: changePercent,
                periodChange: changeValue,
                period: range,
                currentPrice // Ensure we use the latest history close or quote price
            });
        }

        const quote = await yahooFinance.quote(symbol);
        return NextResponse.json(quote);
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch quote', details: String(error) }, { status: 500 });
    }
}

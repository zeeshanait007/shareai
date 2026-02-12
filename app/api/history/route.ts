import { NextRequest, NextResponse } from 'next/server';
import { marketData } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') || '1mo';

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const quotes = await marketData.getHistoricalData(symbol, period);
        return NextResponse.json(quotes);
    } catch (error) {
        console.error(`Error fetching history for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch history', details: String(error) }, { status: 500 });
    }
}

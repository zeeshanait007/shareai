import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const quote = await yahooFinance.quote(symbol);
        return NextResponse.json(quote);
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch quote', details: String(error) }, { status: 500 });
    }
}

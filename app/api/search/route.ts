import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const result: any = await yahooFinance.search(q);
        const quotes = result.quotes.filter((item: any) => item.isYahooFinance);
        return NextResponse.json(quotes);
    } catch (error) {
        console.error(`Error searching ${q}:`, error);
        return NextResponse.json({ error: 'Failed to search', details: String(error) }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { marketData } from '@/lib/api';

export async function POST(req: Request) {
    try {
        const { symbols } = await req.json();

        if (!symbols || !Array.isArray(symbols)) {
            return NextResponse.json({ error: 'Invalid symbols provided' }, { status: 400 });
        }

        // De-duplicate symbols and remove empty strings
        const uniqueSymbols = [...new Set(symbols.filter(s => !!s && typeof s === 'string'))];

        if (uniqueSymbols.length === 0) {
            return NextResponse.json({ quotes: {} });
        }

        const quotes = await marketData.getQuotes(uniqueSymbols);

        return NextResponse.json({ quotes });
    } catch (error) {
        console.error('Portfolio Quotes Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

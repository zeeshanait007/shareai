import { NextRequest, NextResponse } from 'next/server';
import { getGeminiStockAnalysis } from '@/lib/gemini';
import { marketData } from '@/lib/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbol, currentPrice } = body;

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        const [analysis, quote] = await Promise.all([
            getGeminiStockAnalysis(symbol),
            marketData.getQuote(symbol).catch(() => null)
        ]);

        return NextResponse.json({
            ...analysis,
            currentPrice: quote?.regularMarketPrice || currentPrice || 0
        });
    } catch (error: any) {
        console.error("[API-Analysis] Error:", error);
        return NextResponse.json({
            error: 'Failed to generate AI analysis',
            details: error.message
        }, { status: 500 });
    }
}

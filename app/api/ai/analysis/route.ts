import { NextRequest, NextResponse } from 'next/server';
import { getGeminiStockAnalysis } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbol, currentPrice } = body;

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        console.log(`[API-Analysis] Generating analysis for ${symbol}...`);
        const analysis = await getGeminiStockAnalysis(symbol);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("[API-Analysis] Error:", error);
        return NextResponse.json({
            error: 'Failed to generate AI analysis',
            details: error.message
        }, { status: 500 });
    }
}

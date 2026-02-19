import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioComparisonInsight } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets, aiAssets } = body;

        if (!assets || !aiAssets) {
            return NextResponse.json({ error: 'assets and aiAssets are required' }, { status: 400 });
        }

        console.log(`[API-Comparison] Comparing user portfolio with AI target...`);
        const result = await getPortfolioComparisonInsight(assets, aiAssets);

        return NextResponse.json({ insight: result });
    } catch (error: any) {
        console.error("[API-Comparison] Error:", error);
        return NextResponse.json({
            error: 'Failed to compare portfolios',
            details: error.message
        }, { status: 500 });
    }
}

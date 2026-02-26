import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClusterAnalysis } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets, stats } = body;

        if (!assets || !stats) {
            return NextResponse.json({ error: 'Assets and stats are required' }, { status: 400 });
        }

        console.log(`[API-Clusters] Analyzing clusters for ${assets.length} assets...`);
        const clusters = await getGeminiClusterAnalysis(assets, stats);

        return NextResponse.json(clusters);
    } catch (error: any) {
        console.error("[API-Clusters] Error:", error);
        return NextResponse.json({
            error: 'Failed to analyze portfolio clusters',
            details: error.message
        }, { status: 500 });
    }
}

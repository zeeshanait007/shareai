import { NextRequest, NextResponse } from 'next/server';
import { getGeminiProactiveActions } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets, stats } = body;

        if (!assets || !stats) {
            return NextResponse.json({ error: 'Assets and stats are required' }, { status: 400 });
        }

        console.log(`[API-Actions] Generating proactive actions for ${assets.length} assets...`);
        const result = await getGeminiProactiveActions(assets, stats);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API-Actions] Error:", error);
        return NextResponse.json({
            error: 'Failed to generate AI actions',
            details: error.message
        }, { status: 500 });
    }
}

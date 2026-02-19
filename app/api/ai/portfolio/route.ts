import { NextRequest, NextResponse } from 'next/server';
import { generateAIPortfolio } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { totalCapital, userAssets } = body;

        if (totalCapital === undefined) {
            return NextResponse.json({ error: 'totalCapital is required' }, { status: 400 });
        }

        console.log(`[API-Portfolio] Generating AI portfolio for $${totalCapital}...`);
        const result = await generateAIPortfolio(totalCapital, userAssets || []);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API-Portfolio] Error:", error);
        return NextResponse.json({
            error: 'Failed to generate AI portfolio',
            details: error.message
        }, { status: 500 });
    }
}

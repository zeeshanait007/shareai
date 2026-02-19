import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedDashboardSync } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets, stats, totalCapital } = body;

        if (!assets || !stats) {
            return NextResponse.json({ error: 'Assets and stats are required' }, { status: 400 });
        }

        console.log(`[API-Sync] Synchronizing dashboard for ${assets.length} assets...`);
        const result = await getUnifiedDashboardSync(assets, stats, totalCapital || 0);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[API-Sync] Error:", error);
        return NextResponse.json({
            error: 'Failed to sync dashboard AI data',
            details: error.message
        }, { status: 500 });
    }
}

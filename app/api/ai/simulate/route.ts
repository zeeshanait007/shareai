import { NextResponse } from 'next/server';
import { getGeminiRiskSimulation } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const { assets, scenarioId, scenarioName } = await request.json();

        if (!assets || !scenarioId || !scenarioName) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const result = await getGeminiRiskSimulation(assets, scenarioId, scenarioName);
        return NextResponse.json(result);
    } catch (error) {
        console.error('AI Simulation Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

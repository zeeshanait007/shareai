import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { message, history, assets, stats, marketContext } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const response = await getChatResponse(
            message,
            history || [],
            assets || [],
            stats || { netWorth: 0, distribution: {}, beta: 0 },
            marketContext || ""
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
    }
}

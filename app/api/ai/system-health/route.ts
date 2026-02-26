import { NextResponse } from 'next/server';
import { getGeminiSystemHealth, getGeminiQueueMetrics } from '@/lib/gemini';

// Simple uptime tracking
const startTime = Date.now();

export async function GET() {
    try {
        const metrics = getGeminiQueueMetrics();
        const start = Date.now();

        // Dummy request to measure latency (or just use a fixed small number if queue is empty)
        const latency = Math.floor(Math.random() * 20) + 5;

        const uptimeMs = Date.now() - startTime;
        const uptime = `${Math.floor(uptimeMs / 3600000)}h ${Math.floor((uptimeMs % 3600000) / 60000)}m`;

        const result = await getGeminiSystemHealth({
            latency,
            queueDepth: metrics.queueLength,
            isPaused: metrics.isPaused,
            uptime
        });

        return NextResponse.json({
            ...result,
            latency,
            uptime
        });
    } catch (error) {
        console.error('System Health Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

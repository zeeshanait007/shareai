import { NextResponse } from 'next/server';
import { getGeminiMarketContext } from '@/lib/gemini';
import { marketData } from '@/lib/api';

export async function GET() {
    try {
        const symbols = [
            { name: 'Market Fear (VIX)', symbol: '^VIX' },
            { name: 'OMXS30 (Stockholm)', symbol: '^OMX' },
            { name: 'S&P 500 (SPY)', symbol: 'SPY' },
            { name: 'Bitcoin (BTC)', symbol: 'BTC-USD' }
        ];

        const quotes = await Promise.all(symbols.map(async (s) => {
            const quote = await marketData.getQuote(s.symbol);
            return {
                name: s.name,
                value: quote ? quote.regularMarketPrice.toFixed(2) : 'N/A',
                change: quote ? `${quote.regularMarketChangePercent > 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%` : '0.00%'
            };
        }));

        // Fetch some broad news for context
        const news = await marketData.getNews('SPY');

        const result = await getGeminiMarketContext(quotes, news);

        // Merge real values with AI-driven statuses
        const finalIndicators = quotes.map(q => {
            const aiInfo = result.indicators.find(i => i.name === q.name);
            return {
                ...q,
                status: aiInfo?.status || 'Neutral',
                color: aiInfo?.color || 'var(--text-secondary)'
            };
        });

        return NextResponse.json({
            indicators: finalIndicators,
            aiInsight: result.aiInsight
        });
    } catch (error) {
        console.error('Market Context Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

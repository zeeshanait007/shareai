import { NextResponse } from 'next/server';
import { marketData } from '@/lib/api';

// OMXS30 Components (Top 30 Swedish stocks)
const OMXS30_SYMBOLS = [
    'ABB.ST', 'ALFA.ST', 'ASSA-B.ST', 'AZN.ST', 'ATCO-A.ST', 'ATCO-B.ST',
    'BOL.ST', 'ELUX-B.ST', 'ERIC-B.ST', 'ESSITY-B.ST', 'EVO.ST', 'GETI-B.ST',
    'HEXA-B.ST', 'HMB.ST', 'INVE-B.ST', 'NIBE-B.ST', 'NDA-SE.ST', 'SAND.ST',
    'SCA-B.ST', 'SEB-A.ST', 'SHB-A.ST', 'SKF-B.ST', 'SSAB-A.ST', 'SSAB-B.ST',
    'SWED-A.ST', 'SWMA.ST', 'TEL2-B.ST', 'TELIA.ST', 'VOLV-B.ST', 'SK-B.ST'
];

export async function GET() {
    try {
        const quotesRecord = await marketData.getQuotes(OMXS30_SYMBOLS);
        const quotes = Object.values(quotesRecord);

        let advancers = 0;
        let decliners = 0;
        let unchanged = 0;

        quotes.forEach(quote => {
            if (quote.regularMarketChangePercent > 0.1) {
                advancers++;
            } else if (quote.regularMarketChangePercent < -0.1) {
                decliners++;
            } else {
                unchanged++;
            }
        });

        return NextResponse.json({
            index: 'OMXS30',
            advancers,
            decliners,
            unchanged,
            total: quotes.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Breadth API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch breadth data' }, { status: 500 });
    }
}

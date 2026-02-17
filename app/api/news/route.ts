import { NextRequest, NextResponse } from 'next/server';
import { marketData } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const news = await marketData.getNews(q);
        return NextResponse.json({ news });
    } catch (error) {
        console.error(`Error fetching news for ${q}:`, error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

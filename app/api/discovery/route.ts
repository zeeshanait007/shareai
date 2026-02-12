import { NextRequest, NextResponse } from 'next/server';
import { marketData } from '@/lib/api';
import { calculateRSI, calculateSMA, calculateMACD, calculateBollingerBands, generateRecommendation } from '@/lib/indicators';

const POPULAR_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMD', 'SPY', 'QQQ', 'GOOGL', 'AMZN', 'META', 'NFLX', 'BRK-B', 'V', 'JPM'];

export async function GET(request: NextRequest) {
    const results = [];

    // Scanning POPULAR_SYMBOLS
    for (const symbol of POPULAR_SYMBOLS) {
        try {
            const quote = await marketData.getQuote(symbol);
            const history = await marketData.getHistoricalData(symbol, '3mo');

            if (quote && history.length > 50) {
                const closePrices = history.map(h => h.close);
                const rsi = calculateRSI(closePrices)[closePrices.length - 1];
                const sma50 = calculateSMA(closePrices, 50)[closePrices.length - 1];
                const macd = calculateMACD(closePrices);
                const bollinger = calculateBollingerBands(closePrices);

                const rec = generateRecommendation(quote.regularMarketPrice, sma50, rsi, macd, bollinger);

                if (rec.signal.includes('BUY') || rec.signal.includes('SELL')) {
                    results.push({
                        symbol,
                        name: quote.shortName,
                        price: quote.regularMarketPrice,
                        changePercent: quote.regularMarketChangePercent,
                        recommendation: rec
                    });
                }
            }
        } catch (e) {
            console.error(`Error scanning ${symbol} in API:`, e);
        }
    }

    // Sort by conviction score
    results.sort((a, b) => b.recommendation.score - a.recommendation.score);

    return NextResponse.json(results);
}

import YF from 'yahoo-finance2';

const yahooFinance = new YF();

import { StockData, HistoricalData } from './types';

class MarketDataService {
    /**
     * Parses a relative period string (e.g., '1mo', '1y') into a start Date.
     */
    parsePeriod(period: string): Date {
        const now = new Date();
        const date = new Date();
        switch (period) {
            case '1d': date.setHours(now.getHours() - 24); break;
            case '5d': date.setDate(now.getDate() - 5); break;
            case '1mo': date.setMonth(now.getMonth() - 1); break;
            case '3mo': date.setMonth(now.getMonth() - 3); break;
            case '6mo': date.setMonth(now.getMonth() - 6); break;
            case '1y': date.setFullYear(now.getFullYear() - 1); break;
            case 'ytd': return new Date(now.getFullYear(), 0, 1);
            case 'max': return new Date(1970, 0, 1);
            default: date.setMonth(now.getMonth() - 1);
        }
        return date;
    }

    /**
     * Fetches real-time quote for a given symbol.
     */
    async getQuote(symbol: string): Promise<StockData | null> {
        try {
            const quote: any = await yahooFinance.quote(symbol);
            return {
                symbol: quote.symbol,
                regularMarketPrice: quote.regularMarketPrice || 0,
                regularMarketChange: quote.regularMarketChange || 0,
                regularMarketChangePercent: quote.regularMarketChangePercent || 0,
                marketCap: quote.marketCap || 0,
                shortName: quote.shortName || symbol,
                regularMarketVolume: quote.regularMarketVolume || 0,
            };
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
        }
    }

    /**
     * Fetches historical data for charts.
     */
    async getHistoricalData(symbol: string, periodOrDate: string | Date): Promise<HistoricalData[]> {
        try {
            let p1: Date;
            if (periodOrDate instanceof Date) {
                p1 = periodOrDate;
            } else if (typeof periodOrDate === 'string' && periodOrDate.includes('-')) {
                // Likely YYYY-MM-DD
                p1 = new Date(periodOrDate);
            } else {
                // Handle relative period strings
                p1 = this.parsePeriod(periodOrDate as string);
            }

            const p2 = new Date();

            const queryOptions = {
                period1: p1,
                period2: p2,
                interval: '1d' as const
            };
            const result: any = await yahooFinance.chart(symbol, queryOptions);

            if (!result || !result.quotes) return [];

            return result.quotes
                .filter((item: any) => item.close !== null && item.close !== undefined)
                .map((item: any) => ({
                    date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : new Date(item.date).toISOString().split('T')[0],
                    open: item.open ?? 0,
                    high: item.high ?? 0,
                    low: item.low ?? 0,
                    close: item.close ?? 0,
                    volume: item.volume ?? 0,
                }));
        } catch (error) {
            console.error(`Error fetching history for ${symbol}:`, error);
            return [];
        }
    }

    /**
     * Search for symbols
     */
    async search(query: string) {
        try {
            const result: any = await yahooFinance.search(query);
            return result.quotes.filter((q: any) => q.isYahooFinance);
        } catch (error) {
            console.error(`Error searching ${query}:`, error);
            return [];
        }
    }

    /**
     * Fetch news for a symbol
     */
    async getNews(symbol: string): Promise<string> {
        try {
            const result: any = await yahooFinance.search(symbol, { newsCount: 5 });
            if (!result || !result.news) return "";
            return result.news.map((n: any) => `${n.title} (${n.publisher})`).join("\n");
        } catch (error) {
            console.error(`Error fetching news for ${symbol}:`, error);
            return "";
        }
    }
}

export const marketData = new MarketDataService();
export { yahooFinance };

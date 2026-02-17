export interface Action {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    evidence?: {
        label: string;
        value: string;
        benchmark: string;
        status: 'critical' | 'warning' | 'good';
    };
}

export interface StockData {
    symbol: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    marketCap: number;
    shortName: string;
    regularMarketVolume?: number;
}

export interface HistoricalData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

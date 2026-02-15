export type AssetType = 'stock' | 'crypto' | 'private_equity' | 'real_estate' | 'esop';

export interface Asset {
    id: string;
    type: AssetType;
    name: string;
    symbol?: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    valuationDate: string;
    sector?: string;
    location?: string; // For real estate
    vestingSchedule?: any; // For ESOPs
}

export interface WealthSummary {
    totalNetWorth: number;
    liquidAssets: number;
    illiquidAssets: number;
    overallTaxLiability: number;
    riskScore: number;
}

// Mock data for initial implementation
export const mockAssets: Asset[] = [
    {
        id: '1',
        type: 'stock',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        quantity: 50,
        purchasePrice: 150,
        currentPrice: 185.92,
        valuationDate: new Date().toISOString(),
        sector: 'Technology'
    },
    {
        id: '2',
        type: 'crypto',
        name: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.5,
        purchasePrice: 30000,
        currentPrice: 52400,
        valuationDate: new Date().toISOString(),
        sector: 'Currency'
    },
    {
        id: '3',
        type: 'real_estate',
        name: 'Modern Apartment, NYC',
        quantity: 1,
        purchasePrice: 850000,
        currentPrice: 920000,
        valuationDate: new Date().toISOString(),
        location: 'New York, USA'
    },
    {
        id: '4',
        type: 'private_equity',
        name: 'Early Stage Tech Fund',
        quantity: 1,
        purchasePrice: 100000,
        currentPrice: 145000,
        valuationDate: new Date().toISOString(),
        sector: 'Venture Capital'
    },
    {
        id: '5',
        type: 'esop',
        name: 'Company Stock Options',
        symbol: 'TECHX',
        quantity: 1000,
        purchasePrice: 10,
        currentPrice: 45,
        valuationDate: new Date().toISOString(),
        sector: 'Technology'
    }
];

export function calculateNetWorth(assets: Asset[]): number {
    return assets.reduce((total, asset) => total + (asset.quantity * asset.currentPrice), 0);
}

export function getAssetDistribution(assets: Asset[]) {
    const distribution: Record<AssetType, number> = {
        stock: 0,
        crypto: 0,
        private_equity: 0,
        real_estate: 0,
        esop: 0
    };

    assets.forEach(asset => {
        distribution[asset.type] += (asset.quantity * asset.currentPrice);
    });

    return distribution;
}

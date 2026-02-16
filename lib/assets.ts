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
        id: '1b',
        type: 'stock',
        name: 'NVIDIA Corp.',
        symbol: 'NVDA',
        quantity: 120,
        purchasePrice: 450,
        currentPrice: 726.13,
        valuationDate: new Date().toISOString(),
        sector: 'Semiconductors'
    },
    {
        id: '1c',
        type: 'stock',
        name: 'Microsoft',
        symbol: 'MSFT',
        quantity: 30,
        purchasePrice: 320,
        currentPrice: 404.06,
        valuationDate: new Date().toISOString(),
        sector: 'Software'
    },
    {
        id: '2',
        type: 'crypto',
        name: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.85,
        purchasePrice: 30000,
        currentPrice: 52140,
        valuationDate: new Date().toISOString(),
        sector: 'Digital Gold'
    },
    {
        id: '2b',
        type: 'crypto',
        name: 'Ethereum',
        symbol: 'ETH',
        quantity: 12,
        purchasePrice: 1800,
        currentPrice: 2814,
        valuationDate: new Date().toISOString(),
        sector: 'Smart Contracts'
    },
    {
        id: '2c',
        type: 'crypto',
        name: 'Solana',
        symbol: 'SOL',
        quantity: 150,
        purchasePrice: 20,
        currentPrice: 108.45,
        valuationDate: new Date().toISOString(),
        sector: 'Web3 Infrastructure'
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
        id: '3b',
        type: 'real_estate',
        name: 'Beachfront Villa',
        quantity: 1,
        purchasePrice: 1200000,
        currentPrice: 1350000,
        valuationDate: new Date().toISOString(),
        location: 'Miami, Florida'
    },
    {
        id: '4',
        type: 'private_equity',
        name: 'Early Stage Tech Fund',
        quantity: 1,
        purchasePrice: 100000,
        currentPrice: 165000,
        valuationDate: new Date().toISOString(),
        sector: 'Venture Capital'
    },
    {
        id: '5',
        type: 'esop',
        name: 'Company Stock Options',
        symbol: 'TECHX',
        quantity: 5000,
        purchasePrice: 2.5,
        currentPrice: 18.50,
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

import { Asset } from './assets';

export interface SectorBenchmark {
    sector: string;
    weight: number;
}

export const SP500_BENCHMARKS: SectorBenchmark[] = [
    { sector: 'Technology', weight: 0.28 },
    { sector: 'Financials', weight: 0.13 },
    { sector: 'Healthcare', weight: 0.12 },
    { sector: 'Consumer Cyclical', weight: 0.10 },
    { sector: 'Communication Services', weight: 0.08 },
    { sector: 'Industrials', weight: 0.08 },
    { sector: 'Consumer Defensive', weight: 0.07 },
    { sector: 'Energy', weight: 0.04 },
    { sector: 'Real Estate', weight: 0.03 },
    { sector: 'Utilities', weight: 0.02 },
    { sector: 'Basic Materials', weight: 0.02 },
];

export function calculatePortfolioBeta(assets: Asset[]): number {
    // Simplified beta simulation based on asset types
    // Equity: ~1.0, Crypto: ~2.5, Real Estate: ~0.4, PE: ~1.5
    const totalVal = assets.reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);
    if (totalVal === 0) return 1.0;

    const weightedBeta = assets.reduce((sum, a) => {
        let beta = 1.0;
        if (a.type === 'crypto') beta = 2.5;
        if (a.type === 'real_estate') beta = 0.4;
        if (a.type === 'private_equity') beta = 1.6;
        if (a.type === 'esop') beta = 1.8;

        return sum + (beta * (a.currentPrice * a.quantity / totalVal));
    }, 0);

    return Number(weightedBeta.toFixed(2));
}

export function calculateDiversificationRatio(assets: Asset[]): number {
    // Measure of how spread out the portfolio is across types and sectors
    const types = new Set(assets.map(a => a.type));
    const sectors = new Set(assets.map(a => a.sector).filter(Boolean));

    const typeDiversity = Math.min(types.size / 5, 1);
    const sectorDiversity = Math.min(sectors.size / 10, 1);

    return Number(((typeDiversity * 0.4 + sectorDiversity * 0.6) * 100).toFixed(0));
}

export function getSectorAnalysis(assets: Asset[]) {
    const totalVal = assets.reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);
    if (totalVal === 0) return [];

    const portfolioSectors: Record<string, number> = {};
    assets.forEach(a => {
        const sector = a.sector || 'Uncategorized';
        portfolioSectors[sector] = (portfolioSectors[sector] || 0) + (a.currentPrice * a.quantity);
    });

    return Object.entries(portfolioSectors).map(([sector, val]) => {
        const weight = val / totalVal;
        const benchmark = SP500_BENCHMARKS.find(b => b.sector === sector)?.weight || 0;
        return {
            sector,
            weight: Number((weight * 100).toFixed(1)),
            benchmark: Number((benchmark * 100).toFixed(1)),
            diff: Number(((weight - benchmark) * 100).toFixed(1))
        };
    }).sort((a, b) => b.weight - a.weight);
}

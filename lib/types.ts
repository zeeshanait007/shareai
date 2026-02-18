export interface Action {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    urgency?: 'High' | 'Medium' | 'Low';
    evidence?: {
        label: string;
        value: string;
        benchmark: string;
        status: 'critical' | 'warning' | 'good';
    };
    justification?: string;
    expertInsight?: string;
    simpleExplanation?: string;
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

export interface PortfolioSnapshot {
    id: string;
    user_id: string;
    assets: any[]; // Using any[] to avoid circular dependency with assets.ts, or move Asset type here
    metadata: {
        item_count: number;
        total_value?: number;
        source?: 'csv_upload' | 'manual_edit';
        filename?: string;
    };
    created_at: string;
}

export interface DeepInsight {
    volatilityRegime: 'Stable' | 'Trending' | 'Chaotic';
    alphaScore: number;
    institutionalConviction: 'High' | 'Medium' | 'Low';
    convictionExplanation: string;
    macroContext: string;
    riskRewardRatio: string;
    narrative: string;
    userStrategyName?: string;
    aiStrategyName?: string;
    strategicDifference?: string;
    alphaGap?: number;
    convictionScore?: number;
    projectedReturnUser?: number;
    projectedReturnAI?: number;
    riskScore?: number;
    sectorGaps?: Array<{ sector: string; userWeight: number; aiWeight: number }>;
    generatedAt?: number;
    topPick?: {
        symbol: string;
        reason: string;
        impact: string;
    };
    evidence?: {
        quantitativeDrivers: string[];
        factorExposure: Record<string, string>;
        historicalProbability: string;
        correlationImpacts: string;
    };
    riskSensitivity?: {
        rateHikeImpact: string;
        recessionImpact: string;
        worstCaseBand: string;
    };
    counterCase?: {
        thesisInvalidation: string;
        marketShiftRisks: string;
    };
    compliance?: {
        riskMatch: string;
        suitabilityStatus: string;
        regulatoryFlags: string[];
    };
}

export interface StockAnalysis {
    symbol: string;
    thesis: string; // 3 lines summary
    drivers: {
        valuation: string;
        momentum: string;
        macro: string;
        earnings: string;
    };
    risks: string[];
    scenarios: {
        bullish: string;
        bearish: string;
        neutral: string;
    };
    confidenceScore: number; // 0-100
    recommendation: 'Buy' | 'Add to Watch' | 'Monitor' | 'Ignore';
    counterArgument: string; // "Why not?"
}

export interface InstitutionalAnalysis {
    symbol: string;
    recommendation: {
        action: string;
        conviction: number;
        timeframe: string;
    };
    evidence: {
        quantitativeDrivers: string[];
        factorExposure: Record<string, string>;
        historicalProbability: string;
        correlationImpacts: string;
    };
    riskSensitivity: {
        rateHikeImpact: string;
        recessionImpact: string;
        worstCaseBand: string;
    };
    counterCase: {
        thesisInvalidation: string;
        marketShiftRisks: string;
    };
    compliance: {
        riskMatch: string;
        suitabilityStatus: string;
        regulatoryFlags: string[];
    };
}

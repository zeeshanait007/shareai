/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(NaN); // Not enough data
            continue;
        }
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
    }
    return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
    const result = new Array(data.length).fill(NaN);
    if (data.length < period) return result;

    const multiplier = 2 / (period + 1);

    // Initial SMA for the first EMA point
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    let ema = sum / period;
    result[period - 1] = ema;

    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema;
        result[i] = ema;
    }
    return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: number[], period: number = 14): number[] {
    const result = new Array(data.length).fill(NaN);
    if (data.length <= period) return result;

    let initialGain = 0;
    let initialLoss = 0;
    for (let i = 1; i <= period; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) initialGain += change;
        else initialLoss -= change;
    }
    let avgGain = initialGain / period;
    let avgLoss = initialLoss / period;

    result[period] = 100 - (100 / (1 + (avgGain / (avgLoss === 0 ? 0.00001 : avgLoss))));

    for (let i = period + 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        const currentGain = change > 0 ? change : 0;
        const currentLoss = change < 0 ? -change : 0;

        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

        const rs = avgGain / (avgLoss === 0 ? 0.00001 : avgLoss);
        result[i] = 100 - (100 / (1 + rs));
    }

    return result;
}

/**
 * Calculate MACD
 */
export function calculateMACD(data: number[]) {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    const macdLine = ema12.map((e12, i) => e12 - ema26[i]);
    const signalLine = calculateEMA(macdLine.filter(v => !isNaN(v)), 9);

    // Re-align signal line with full data length
    const paddedSignal = new Array(data.length).fill(NaN);
    const offset = data.length - signalLine.length;
    for (let i = 0; i < signalLine.length; i++) {
        paddedSignal[i + offset] = signalLine[i];
    }

    return {
        macd: macdLine,
        signal: paddedSignal,
        histogram: macdLine.map((m, i) => m - paddedSignal[i])
    };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2) {
    const sma = calculateSMA(data, period);
    const upper = new Array(data.length).fill(NaN);
    const lower = new Array(data.length).fill(NaN);

    for (let i = period - 1; i < data.length; i++) {
        const chunk = data.slice(i - period + 1, i + 1);
        const avg = sma[i];
        const squareDiffs = chunk.map(v => Math.pow(v - avg, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / period;
        const sd = Math.sqrt(variance);

        upper[i] = avg + (stdDev * sd);
        lower[i] = avg - (stdDev * sd);
    }

    return { middle: sma, upper, lower };
}

/**
 * Calculate Liquidity Health Score (0-100)
 * Higher is better (more liquid)
 */
export function calculateLiquidityHealth(volume: number, marketCap: number): number {
    // Turnover ratio heuristic: average daily volume vs market cap
    // A simplified version for a single day quote
    const turnoverRatio = (volume * 100) / (marketCap || 1e9);
    // Typical healthy liquidity for a large cap is > 0.1% turnover daily
    let score = turnoverRatio * 200; // 0.5% turnover = 100 score
    return Math.max(0, Math.min(100, score || 50));
}

/**
 * Calculate Drawdown Exposure Score (0-100)
 * Lower is better (less exposure/drop)
 */
export function calculateDrawdownExposure(currentPrice: number, history: number[]): number {
    if (history.length === 0) return 0;
    const maxPrice = Math.max(...history);
    const drawdown = ((maxPrice - currentPrice) / maxPrice) * 100;
    // 0% drawdown = 100 health (top), 20% drawdown = 50 health, 40%+ = 0 health
    const score = 100 - (drawdown * 2.5);
    return Math.max(0, Math.min(100, score || 0));
}

/**
 * Calculate Tax Efficiency Score (0-100)
 * Higher is better (more efficient/lower tax drag)
 */
export function calculateTaxEfficiency(symbol: string): number {
    // This is hard to calculate without more data, so we use a growth vs value heuristic
    // or placeholder based on typical sector traits. Real implementation would use dividend yield.
    // For now, let's return a neutral-high score for growth-oriented tickers.
    const growthSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
    if (growthSymbols.includes(symbol)) return 85;
    return 65; // Base score
}

/**
 * Calculate Diversification/Concentration Risk Score (0-100)
 * Higher is better (less concentration/better diversification impact)
 */
export function calculateRiskScores(symbol: string, priceChangePercent: number) {
    // For a single stock, concentration risk is how much it deviates from market mean
    // High volatility = higher concentration risk for a portfolio holder
    const volatilityImpact = Math.abs(priceChangePercent) * 10;
    const concentrationRisk = 100 - volatilityImpact;
    const diversificationImpact = 100 - (volatilityImpact / 2); // Heuristic

    return {
        concentration: Math.max(0, Math.min(100, concentrationRisk || 50)),
        diversification: Math.max(0, Math.min(100, diversificationImpact || 70))
    };
}

/**
 * Calculate estimated tax liability based on unrealized gains
 */
export function calculateTaxLiability(assets: any[]) {
    let shortTermGains = 0;
    let longTermGains = 0;

    assets.forEach((asset, index) => {
        const gain = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
        if (gain > 0) {
            // Deterministic heuristic: using asset name length + index to simulate LT/ST split
            // This prevents hydration mismatches while still providing variety.
            if ((asset.name.length + index) % 2 === 0) {
                longTermGains += gain;
            } else {
                shortTermGains += gain;
            }
        }
    });

    const taxEstimate = (shortTermGains * 0.30) + (longTermGains * 0.15);
    return {
        totalGain: shortTermGains + longTermGains,
        taxEstimate,
        efficiency: Math.max(0, 100 - (taxEstimate / (shortTermGains + longTermGains || 1) * 100))
    };
}

import { getSectorAnalysis, calculatePortfolioBeta } from './analytics';



export interface Recommendation {
    signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
    score: number; // 0-100
    reason: string;
}

export function generateRecommendation(
    price: number,
    sma50: number,
    rsi: number,
    macd: { macd: number[], signal: number[], histogram: number[] },
    bollinger: { middle: number[], upper: number[], lower: number[] }
): Recommendation {
    let score = 50; // Neutral start
    const reasons = [];

    // Trend Analysis (Price vs SMA)
    if (price > sma50) {
        score += 10;
        reasons.push('Price is above 50-day moving average (Bullish Trend)');
    } else {
        score -= 10;
        reasons.push('Price is below 50-day moving average (Bearish Trend)');
    }

    // RSI Analysis
    if (rsi < 30) {
        score += 20;
        reasons.push('RSI indicates oversold conditions (Buy Signal)');
    } else if (rsi > 70) {
        score -= 20;
        reasons.push('RSI indicates overbought conditions (Sell Signal)');
    } else if (rsi < 45) {
        score += 5;
    } else if (rsi > 55) {
        score -= 5;
    }

    // MACD Analysis
    const lastMACD = macd.macd?.[macd.macd.length - 1];
    const lastSignal = macd.signal?.[macd.signal.length - 1];
    const lastHist = macd.histogram?.[macd.histogram.length - 1];
    const prevHist = macd.histogram?.[macd.histogram.length - 2];

    if (lastHist !== undefined && prevHist !== undefined) {
        if (lastHist > 0 && prevHist <= 0) {
            score += 15;
            reasons.push('MACD bullish crossover detected');
        } else if (lastHist < 0 && prevHist >= 0) {
            score -= 15;
            reasons.push('MACD bearish crossover detected');
        } else if (lastHist > 0) {
            score += 5;
        } else {
            score -= 5;
        }
    }

    // Bollinger Band Analysis
    const lastUpper = bollinger.upper?.[bollinger.upper.length - 1];
    const lastLower = bollinger.lower?.[bollinger.lower.length - 1];

    if (lastUpper !== undefined && lastLower !== undefined) {
        if (price <= lastLower) {
            score += 15;
            reasons.push('Price touched lower Bollinger Band (Potential Rebound)');
        } else if (price >= lastUpper) {
            score -= 15;
            reasons.push('Price touched upper Bollinger Band (Potential Pullback)');
        }
    }

    // Consolidate Signal
    let signal: Recommendation['signal'] = 'HOLD';
    if (score >= 80) signal = 'STRONG BUY';
    else if (score >= 60) signal = 'BUY';
    else if (score <= 20) signal = 'STRONG SELL';
    else if (score <= 40) signal = 'SELL';

    // Ensure score stays in 0-100
    score = Math.max(0, Math.min(100, score));

    return {
        signal,
        score,
        reason: reasons[reasons.length - 1] || 'Market shows mixed signals.'
    };
}

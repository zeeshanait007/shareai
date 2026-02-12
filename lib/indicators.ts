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

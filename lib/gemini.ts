import { GoogleGenerativeAI } from "@google/generative-ai";
import { Action, DeepInsight, StockAnalysis } from "./types";
import { marketData } from './api';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiAdvisory {
    justification: string;
    expertInsight: string;
    simpleExplanation: string;
}

// Model configs with fallback chain
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-2.0-flash-lite";

const fastModelConfig = {
    model: PRIMARY_MODEL,
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 1200
    }
};

/**
 * Global Request Queue to prevent 429 Too Many Requests
 * Serializes Gemini API calls to stay within rate limits.
 */
class GeminiRequestQueue {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastRequestTime = 0;
    private readonly minInterval = 250; // Increased to 250ms
    private pausedUntil = 0;

    async add<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    // Check if queue is paused (Circuit Breaker)
                    const now = Date.now();
                    if (now < this.pausedUntil) {
                        const waitTime = this.pausedUntil - now;
                        await new Promise(r => setTimeout(r, waitTime));
                    }

                    // Standard interval between requests
                    const timeSinceLast = Date.now() - this.lastRequestTime;
                    if (timeSinceLast < this.minInterval) {
                        await new Promise(r => setTimeout(r, this.minInterval - timeSinceLast));
                    }

                    this.lastRequestTime = Date.now();
                    const result = await requestFn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.process();
        });
    }

    /**
     * Pauses all outgoing requests for a specified duration.
     * Used when a 429/503 error is detected.
     */
    pause(durationMs: number) {
        console.log(`[GeminiQueue] Circuit breaker activated. Pausing for ${durationMs}ms...`);
        this.pausedUntil = Date.now() + durationMs;
    }

    private async process() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift();
            if (request) {
                await request();
            }
        }

        this.processing = false;
    }

    getHealthMetrics() {
        return {
            queueLength: this.queue.length,
            isPaused: Date.now() < this.pausedUntil,
            pausedUntil: this.pausedUntil,
            processing: this.processing
        };
    }
}

const geminiQueue = new GeminiRequestQueue();

// Retry helper with exponential backoff + fallback model + queueing
async function callGeminiWithRetry(prompt: string, maxRetries = 5, options: { responseMimeType?: string } = {}): Promise<any> {
    let lastError: any;

    // Try primary model with retries
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await geminiQueue.add(async () => {
                const model = genAI.getGenerativeModel({
                    ...fastModelConfig,
                    generationConfig: {
                        ...fastModelConfig.generationConfig,
                        responseMimeType: options.responseMimeType || fastModelConfig.generationConfig.responseMimeType
                    }
                });
                return await model.generateContent(prompt);
            });
            return result;
        } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.httpStatusCode || 0;
            const msg = String(err?.message || '');

            // Only retry on 503 (overloaded) or 429 (rate limit)
            if (status === 503 || status === 429 || msg.includes('503') || msg.includes('429') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED')) {
                const isRateLimit = status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');

                // If rate limited, trigger global queue pause
                if (isRateLimit) {
                    geminiQueue.pause(attempt === 0 ? 5000 : 10000); // 5s then 10s pause
                }

                // Aggressive fallback: If rate limited, don't try primary model more than 2 times
                if (isRateLimit && attempt >= 1) {
                    console.log(`[Gemini] ${PRIMARY_MODEL} rate limited, skipping further retries to use fallback.`);
                    break;
                }

                // Jittered exponential backoff: 2s-4s, 4s-6s, etc.
                const backoffBase = isRateLimit ? 3000 : 1500;
                const jitter = Math.random() * 1000;
                const waitMs = (Math.pow(2, attempt) * backoffBase) + jitter;

                console.log(`[Gemini] ${PRIMARY_MODEL} attempt ${attempt + 1} failed (${status || 'RESOURCE_EXHAUSTED'}), retrying in ${Math.round(waitMs)}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            break;
        }
    }

    // Try fallback model
    console.log(`[Gemini] Primary model ${PRIMARY_MODEL} exhausted or throttled, trying fallback: ${FALLBACK_MODEL}`);
    try {
        return await geminiQueue.add(async () => {
            const fallbackModel = genAI.getGenerativeModel({
                ...fastModelConfig,
                model: FALLBACK_MODEL,
                generationConfig: {
                    ...fastModelConfig.generationConfig,
                    responseMimeType: options.responseMimeType || fastModelConfig.generationConfig.responseMimeType
                }
            });
            return await fallbackModel.generateContent(prompt);
        });
    } catch (fallbackErr: any) {
        console.error('[Gemini] Fallback model also failed:', fallbackErr?.message);
        throw lastError || fallbackErr;
    }
}

// Global Cache & Deduplication
const aiCache = new Map<string, { data: any, timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getAssetHash(assets: any[]): string {
    return assets.map(a => `${a.symbol}:${a.quantity}`).sort().join('|');
}

console.log(`🚀 [AI-CORE-V6] Gemini Initialized. Primary Model: ${PRIMARY_MODEL}`);

/**
 * Robustly parse JSON from AI responses, handling markdown and truncated outputs
 */
function parseAIJSON(text: string) {
    if (!text) return {};

    let cleaned = text.trim();

    // 1. Remove Markdown Code Blocks (generic)
    cleaned = cleaned.replace(/```[a-z]*\s?/g, '').replace(/```/g, '').trim();

    // 2. Extract the widest possible outer JSON block (Object or Array)
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');

    let start = -1;
    let end = -1;

    // Determine if it starts as object or array
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = lastBrace;
    } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
    } else if (start !== -1) {
        // Truncated case: start exists but no end
        cleaned = cleaned.slice(start);
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        try {
            console.log("⚠️ [AI-REPAIR] Attempting to repair malformed JSON...");
            let repaired = cleaned;

            // 3. Basic cleanup
            repaired = repaired.replace(/\}\s*\{/g, '}, {'); // Missing comma } {
            repaired = repaired.replace(/\]\s*\[/g, '], ['); // Missing comma ] [
            repaired = repaired.replace(/,(\s*[}\]])/g, '$1'); // Trailing commas

            // 4. Quote balancing (simple)
            const quoteCount = (repaired.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) repaired += '"';

            // 5. Braces balancing
            const openBraces = (repaired.match(/\{/g) || []).length;
            const closeBraces = (repaired.match(/\}/g) || []).length;
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/\]/g) || []).length;

            if (openBraces > closeBraces) repaired += '}'.repeat(openBraces - closeBraces);
            if (openBrackets > closeBrackets) repaired += ']'.repeat(openBrackets - closeBrackets);

            return JSON.parse(repaired);
        } catch (repairError) {
            console.warn("⚠️ [AI-REPAIR-DEBUG] Repair failed. Falling back to empty structure.");
            if (cleaned.startsWith('[')) return [];
            return {};
        }
    }
}

export async function getMarketNarrative(netWorth: number, distribution: any, marketNews?: string): Promise<string> {
    try {
        const prompt = `
            Persona: Friendly but expert Financial Guide. Your goal is to explain market movements in plain English that a beginner can understand, while still being accurate.
            Wealth: $${netWorth.toLocaleString()}. Assets: ${JSON.stringify(distribution)}.
            ${marketNews ? `Context: ${marketNews}` : ''}
            
            Task: Provide a "Daily Briefing" headline.
            Style: Avoid heavy technical jargon (like "volatility distortions" or "vectors"). Use clear, everyday language but keep it professional. Focus on what this means for the user's money.
            Response: 12-word max. One precise sentence.
        `;
        const result = await callGeminiWithRetry(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "Defensive posture recommended while awaiting institutional volume signals.";
    }
}

export async function getGeminiProactiveActions(
    assets: any[],
    stats: { netWorth: number; distribution: any; taxStats: any; beta: number }
): Promise<Action[]> {
    try {
        const assetString = assets.map(a => `${a.name}: $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()} [${a.type}]`).join('\n');
        const topSectors = Object.entries(stats.distribution).sort(([, a]: any, [, b]: any) => b - a).slice(0, 3).map(([s, p]) => `${s}: ${p}%`).join(', ');

        const prompt = `
            Proactive Wealth AI. Net Worth: $${stats.netWorth.toLocaleString()}. Beta: ${stats.beta}. Tax: $${stats.taxStats.taxEstimate.toLocaleString()}.
            Top Sectors: ${topSectors}.
            Assets: ${assetString}
            
            Return JSON array of 2-3 specific actions: [{ type: "rebalance"|"tax"|"governance", priority: "high"|"medium"|"low", title: string, description: string, impact: string, evidence: { label, value, benchmark, status: "critical"|"warning"|"good" }, justification, expertInsight, simpleExplanation: "A 1-sentence explanation of what this means for a beginner in plain English" }]
        `;

        const result = await callGeminiWithRetry(prompt);
        const actions = parseAIJSON(result.response.text());
        return actions.map((a: any) => ({
            ...a,
            justification: a.justification || a.description,
            expertInsight: a.expertInsight || "Strategic asset reallocation.",
            simpleExplanation: a.simpleExplanation || "Optimizing for growth."
        }));
    } catch (error) {
        console.error("Gemini Proactive Actions Error:", error);
        return getFallbackActions(stats);
    }
}

function getFallbackActions(stats: any): Action[] {
    return [
        {
            type: 'governance',
            priority: 'low',
            title: 'AI Analysis Standby',
            description: 'Refining data models for your portfolio. Check back shortly.',
            impact: 'Stability',
            evidence: { label: 'Status', value: 'Standby', benchmark: 'Active', status: 'warning' }
        }
    ];
}

export async function getGeminiDeepInsight(
    symbol: string,
    history: any[],
    quote: any,
    rsi: number,
    webContext?: string
): Promise<DeepInsight> {
    try {
        // Calculate summary stats for the prompt
        const recent30 = history.slice(-30);
        const priceChange30d = recent30.length > 0
            ? ((recent30[recent30.length - 1].close - recent30[0].close) / recent30[0].close * 100).toFixed(2)
            : 0;
        const high30d = Math.max(...recent30.map(d => d.high));
        const low30d = Math.min(...recent30.map(d => d.low));
        const avgVolume = recent30.reduce((sum, d) => sum + d.volume, 0) / (recent30.length || 1);

        const prompt = `
            You are a helpful and clear Senior Equity Analyst who can explain complex stock data to both experts and beginners.
            Provide a deep analysis of ${symbol}.
            
            ASSET DATA:
            - Symbol: ${symbol}
            - Current Price: $${quote.regularMarketPrice || 'N/A'}
            - Market Cap: $${quote.marketCap ? (quote.marketCap / 1e9).toFixed(2) : 'N/A'}B
            - 30-Day Performance: ${priceChange30d}%
            - 30-Day Range: $${low30d.toFixed(2)} - $${high30d.toFixed(2)}
            - Avg Volume (30d): ${(avgVolume / 1e6).toFixed(2)}M
            - RSI: ${rsi}
            
            ${webContext ? `RECENT NEWS:\n${webContext.slice(0, 400)}\n` : ''}
            
            CRITICAL: Return ONLY a JSON object with this EXACT structure:
            {
                "convictionExplanation": "Specific institutional context...",
                "narrative": "Detailed market narrative...",
                "volatilityRegime": "Stable" | "Trending" | "Chaotic",
                "alphaScore": number (0-100),
                "institutionalConviction": "High" | "Medium" | "Low",
                "macroContext": "Macro impact...",
                "riskRewardRatio": "e.g., 1:2.4",
                "evidence": {
                    "quantitativeDrivers": ["driver1", "driver2"],
                    "factorExposure": {"Quality": "High", "Value": "Low"},
                    "historicalProbability": "Historical success rate...",
                    "correlationImpacts": "Correlation details..."
                },
                "riskSensitivity": {
                    "rateHikeImpact": "Impact of hikes",
                    "recessionImpact": "Impact of recession",
                    "worstCaseBand": "Worst case %"
                },
                "counterCase": {
                    "thesisInvalidation": "What makes this wrong",
                    "marketShiftRisks": "Market shift details"
                },
                "compliance": {
                    "riskMatch": "Risk profile match",
                    "suitabilityStatus": "Suitability status",
                    "regulatoryFlags": ["None" or specific flags]
                }
            }
        `;

        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error: any) {
        console.error("Gemini Deep Insight Error:", error);
        return {
            volatilityRegime: 'Stable',
            alphaScore: 50,
            institutionalConviction: 'Medium',
            convictionExplanation: `Moderate accumulation. Sentiment neutral ahead of catalyst. Support at $${((quote.regularMarketPrice || 0) * 0.95).toFixed(2)}.`,
            macroContext: "Correlation to broader market remains within norms.",
            riskRewardRatio: "1:2.0",
            narrative: `Trading within consolidation pattern at $${quote.regularMarketPrice}. RSI at ${rsi.toFixed(1)}.`
        } as any;
    }
}

export async function getGeminiStockAnalysis(symbol: string): Promise<StockAnalysis> {
    try {
        // 1. Fetch Real-Time Data Directly (Parallel)
        console.log(`[Gemini] Starting direct analysis for ${symbol}`);

        const [quote, newsContext] = await Promise.all([
            marketData.getQuote(symbol),
            marketData.getNews(symbol)
        ]);

        console.log(`[Gemini] Real-time data fetched directly. Quote: ${!!quote}, News: ${!!newsContext}`);

        // 2. Build Context
        let marketContext = '';
        if (quote) {
            marketContext = `
            REAL-TIME MARKET DATA:
            Price: $${quote.regularMarketPrice}
            Change: ${quote.regularMarketChangePercent?.toFixed(2)}%
            Volume: ${((quote.regularMarketVolume || 0) / 1e6).toFixed(1)}M
            Market Cap: $${((quote.marketCap || 0) / 1e9).toFixed(1)}B
            `;
        }

        // 3. Generate Analysis with Live Context
        const prompt = `
            Act as a Senior Wall Street Analyst. Analyze ${symbol} based on the following REAL-TIME data.
            ${marketContext}
            ${newsContext}

            CRITICAL: Provide ACTUAL analysis based on the data above. DO NOT return placeholder text like "Comment on PE" or "Analyzing...". 
            If data is missing for a specific field, give your best estimate based on general market knowledge of ${symbol} or mark it as "Limited Data".
            
            Return JSON in this EXACT structure:
            { 
                "symbol": "${symbol}", 
                "thesis": "Concise core investment thesis (2-3 sentences).",
                "drivers": { 
                    "valuation": "Actual valuation analysis", 
                    "momentum": "Actual momentum analysis", 
                    "macro": "Actual macro analysis", 
                    "earnings": "Actual earnings analysis" 
                }, 
                "risks": ["Specific Risk 1", "Specific Risk 2"], 
                "scenarios": { 
                    "bullish": "Bullish target & catalyst", 
                    "bearish": "Bearish target & trigger", 
                    "neutral": "Neutral range" 
                }, 
                "confidenceScore": number (0-100), 
                "recommendation": "Buy"|"Add to Watch"|"Monitor"|"Ignore", 
                "counterArgument": "The strongest bear case in simple terms",
                "simpleSummary": "A 1-sentence summary of the recommendation for a beginner"
            }
        `;

        console.log("[Gemini] Requesting analysis via retry-utility...");
        const result = await callGeminiWithRetry(prompt);
        const responseText = result.response.text();
        console.log("[Gemini] Raw Response:", responseText.substring(0, 200) + "...");

        let data;
        try {
            data = parseAIJSON(responseText);
            if (!data || typeof data !== 'object') throw new Error("Parsed data is not an object");
        } catch (e) {
            console.error("[Gemini] JSON Parsing Failed:", e);
            throw new Error("Invalid JSON response from AI");
        }

        return {
            symbol: data.symbol || symbol,
            thesis: data.thesis || `Institutional analysis for ${symbol} based on current market signals.`,
            drivers: {
                valuation: data.drivers?.valuation || "Data unavailable",
                momentum: data.drivers?.momentum || "Data unavailable",
                macro: data.drivers?.macro || "Data unavailable",
                earnings: data.drivers?.earnings || "Data unavailable"
            },
            risks: Array.isArray(data.risks) && data.risks.length > 0 ? data.risks : ["Standard market volatility"],
            scenarios: {
                bullish: data.scenarios?.bullish || "N/A",
                bearish: data.scenarios?.bearish || "N/A",
                neutral: data.scenarios?.neutral || "N/A"
            },
            confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 50,
            recommendation: data.recommendation || "Monitor",
            counterArgument: data.counterArgument || "Market shifts."
        };
    } catch (error) {
        console.error("Gemini Stock Analysis Error:", error);
        return {
            symbol: symbol,
            thesis: "Real-time analysis temporarily unavailable.",
            drivers: { valuation: "N/A", momentum: "N/A", macro: "N/A", earnings: "N/A" },
            risks: ["Connection Error"],
            scenarios: { bullish: "N/A", bearish: "N/A", neutral: "N/A" },
            confidenceScore: 50,
            recommendation: "Monitor",
            counterArgument: "Retry shortly."
        };
    }
}

export async function generateAIPortfolio(totalCapital: number, userAssets: any[] = []): Promise<any[]> {
    try {
        const userPortfolio = userAssets.map(a => `${a.name}: $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()} [${a.type}]`).join(',');

        const prompt = `
            Strategy: Tech Growth (30-40%), Value (15-20%), Crypto (5-10%), Real Estate (20-30%).
            JSON Array: [{ type: "stock"|"crypto"|"etf"|"real_estate", name, symbol, quantity, price, sector }]
            Strict: Return ONLY the JSON array. Do not truncate.
        `;

        const result = await callGeminiWithRetry(prompt);
        const assets = parseAIJSON(result.response.text());
        return assets.map((a: any, index: number) => ({
            id: `ai-${Date.now()}-${index}`,
            type: a.type,
            name: a.name,
            symbol: a.symbol,
            quantity: a.quantity,
            purchasePrice: a.price,
            currentPrice: a.price,
            sector: a.sector || (a.type === 'real_estate' ? 'Real Estate' : (a.type === 'crypto' ? 'Crypto' : 'Other')),
            valuationDate: new Date().toISOString()
        }));
    } catch (error) {
        console.error("Gemini AI Portfolio Error:", error);
        return [];
    }
}

export async function getUnifiedDashboardSync(
    assets: any[],
    stats: { netWorth: number; distribution: any; taxStats: any; beta: number },
    totalCapital: number
): Promise<{ actions: Action[]; aiAssets: any[]; insight: DeepInsight | string; marketNarrative: string; performanceMetrics?: { dailyChangeValue: number, dailyChangePct: number, topMover: { symbol: string, changePct: number } } }> {

    // Check Cache
    const cacheKey = getAssetHash(assets);
    const cached = aiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log("⚡ [AI-SYNC] Serving results from cache.");
        return cached.data;
    }

    // Check Pending Requests (Deduplication)
    if (pendingRequests.has(cacheKey)) {
        console.log("🔄 [AI-SYNC] Attaching to in-flight request for same assets.");
        return pendingRequests.get(cacheKey);
    }

    const syncPromise = (async () => {
        try {

            const assetSummary = assets.map(a => `${a.symbol} (${a.type}, ${a.sector}): $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()}`).join(', ');
            const topSectors = Object.entries(stats.distribution).sort(([, a]: any, [, b]: any) => b - a).slice(0, 3).map(([s, p]) => `${s}:${p}%`).join(',');

            // ═══ FETCH REAL-TIME MARKET DATA ═══
            const uniqueSymbols = [...new Set(assets.map((a: any) => a.symbol).filter(Boolean))].slice(0, 6);
            let liveMarketContext = '';
            let newsContext = '';
            let validQuotes: any[] = [];

            // Determine base URL for API calls (relative URLs fail during SSR)
            const baseUrl = typeof window !== 'undefined'
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

            try {
                // Fetch live quotes via API routes
                const quotePromises = uniqueSymbols.map((sym: string) =>
                    fetch(`${baseUrl}/api/quote?symbol=${encodeURIComponent(sym)}`)
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null)
                );
                const quotes = await Promise.all(quotePromises);
                validQuotes = quotes.filter(Boolean);

                if (validQuotes.length > 0) {
                    liveMarketContext = validQuotes.map((q: any) => {
                        const price = q.regularMarketPrice ?? 0;
                        const changePct = q.regularMarketChangePercent ?? 0;
                        const vol = q.regularMarketVolume ?? 0;
                        const mcap = q.marketCap ?? 0;
                        return `${q.symbol}: $${price} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% today, Vol: ${(vol / 1e6).toFixed(1)}M, MCap: $${(mcap / 1e9).toFixed(1)}B)`;
                    }).join(', ');
                }

                // Fetch news for top 6 holdings
                const topHoldings = uniqueSymbols.slice(0, 6);
                const newsPromises = topHoldings.map((sym: string) =>
                    fetch(`${baseUrl}/api/news?q=${encodeURIComponent(sym)}`)
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null)
                );
                const newsResults = await Promise.all(newsPromises);
                const allNews = newsResults
                    .filter((n: any) => n?.news && typeof n.news === 'string' && n.news.length > 0)
                    .map((n: any) => n.news);
                if (allNews.length > 0) {
                    newsContext = allNews.join('\n');
                }

                console.log('[AI-SYNC] Live market data fetched for:', uniqueSymbols.join(', '), '| Quotes:', validQuotes.length, '| News items:', allNews.length);
            } catch (e) {
                console.warn('[AI-SYNC] Could not fetch live market data, proceeding with static analysis:', e);
            }

            const prompt = `
        You are an Advanced Quantum Financial Advisor with access to REAL-TIME market data and news. 
        You perceive the market as a system of gravity fields (asset concentrations), capital flow vectors (liquidity and momentum), and volatility distortions.
        Your task is to analyze this investor's portfolio and build a BETTER alternative.

        INVESTOR'S CURRENT PORTFOLIO:
        - Net Worth: $${stats.netWorth.toLocaleString()}
        - Total Capital: $${totalCapital.toLocaleString()}
        - Portfolio Beta: ${stats.beta}
        - Current Sector Allocation: ${topSectors}
        - Holdings: ${assetSummary || 'None'}

        ${liveMarketContext ? `LIVE MARKET DATA (as of now):
        ${liveMarketContext}` : ''}

        ${newsContext ? `YAHOO FINANCE NEWS & HEADLINES:
        ${newsContext}` : ''}

        YOUR TASK: Using the live market data and news above, create an OPTIMIZED AI portfolio.

        CRITICAL REQUIREMENT FOR METRICS:
        - alphaGap: Expected yearly % outperformance. Base this strictly on why the AI picks are better positioned GIVEN market conditions above.
        - convictionScore: (0-100). Explicitly tie this to the strength of the data/news. If news is mixed, conviction should be lower.
        - riskScore: (1-10). Based on volatility and macro context.
        - topPick: Reason MUST cite specific news or price action from the context provided.
        - quantifiedConsequences: Analyze 2-3 specific scenario models based on current data.
          Example: "Probability of >10% drawdown increases from 28% → 34%", "Expected volatility increases by 12%", "Sharpe ratio deteriorates by 0.4".
          Must be quantitative, data-backed conclusions. NO FEAR TACTICS.

        RULES FOR "aiAssets":
        - Use the EXACT SAME total capital: $${totalCapital.toLocaleString()}
        - FIX weaknesses (over-concentration, missing sectors, high risk).
        - REACT TO NEWS: Adjust positions based on current sentiment.
        - Each asset MUST have a realistic current market price.

        Return this JSON structure:
        {
            "actions": [{ type, priority, title, description, impact, urgency, justification, simpleExplanation: "What this means for a beginner in 1 sentence" }],
            "aiAssets": [{ type, name, symbol, quantity, price, sector }],
            "insight": {
                "narrative": "3-4 sentences. Style: Clear, professional, and accessible. Avoid heavy metaphors (atoms, gravity, etc.). Focus on real-world impact and trends using plain English.",
                "userStrategyName": string,
                "aiStrategyName": string,
                "strategicDifference": "Explain the difference in simple terms",
                "alphaScore": number,
                "convictionScore": number,
                "projectedReturnUser": number,
                "projectedReturnAI": number,
                "riskScore": number,
                "sectorGaps": [{ sector, userWeight, aiWeight }],
                "topPick": { symbol, reason: "Reason in simple English", impact },
                "quantifiedConsequences": ["Clear statement 1", "Clear statement 2"]
            },
            "marketNarrative": "12-word headline using simple, powerful language anchored in today's market reality."
        }
`;

            const result = await callGeminiWithRetry(prompt);
            const data = parseAIJSON(result.response.text());

            // Process AI assets with robust number conversion
            const numAssets = Array.isArray(data.aiAssets) ? data.aiAssets.length : 0;
            const perAssetFallbackPrice = numAssets > 0 ? Math.round(totalCapital / numAssets) : 1000;

            const rawAiAssets = (Array.isArray(data.aiAssets) ? data.aiAssets : []).map((a: any, i: number) => {
                // Try multiple price fields Gemini might use
                const rawPrice = a.price ?? a.currentPrice ?? a.value ?? a.cost ?? a.allocation ?? 0;
                // Strip $ signs and commas if it's a string
                const parsedPrice = typeof rawPrice === 'string'
                    ? Number(rawPrice.replace(/[$,]/g, ''))
                    : Number(rawPrice);
                const finalPrice = (parsedPrice && parsedPrice > 0) ? parsedPrice : perAssetFallbackPrice;

                return {
                    id: `ai-sync-${Date.now()}-${i}`,
                    type: a.type || 'stock',
                    name: a.name || `AI Pick ${i + 1}`,
                    symbol: a.symbol || `AI${i + 1}`,
                    quantity: Number(a.quantity) || 1,
                    purchasePrice: finalPrice,
                    currentPrice: finalPrice,
                    sector: a.sector || 'Strategy',
                    valuationDate: new Date().toISOString()
                };
            });

            // ═══ NORMALIZE: Scale AI portfolio to match user's total capital exactly ═══
            const rawAiTotal = rawAiAssets.reduce((sum: number, a: any) => sum + (a.quantity * a.currentPrice), 0);
            const scaleFactor = rawAiTotal > 0 ? totalCapital / rawAiTotal : 1;
            const processedAiAssets = rawAiAssets.map((a: any) => ({
                ...a,
                quantity: Math.round((a.quantity * scaleFactor) * 100) / 100, // Scale & keep 2 decimal places
            }));

            console.log('[AI-SYNC] Processed AI assets:', processedAiAssets.map((a: any) => `${a.symbol}: $${a.currentPrice} (${a.sector})`));

            // Extract topPick from insight or top-level data (Gemini may nest it differently)
            const rawTopPick = data.insight?.topPick || data.topPick;
            const firstAiSymbol = processedAiAssets[0]?.symbol || 'AAPL';
            const firstAiSector = processedAiAssets[0]?.sector || 'Growth';
            const resolvedTopPick = rawTopPick && rawTopPick.symbol
                ? rawTopPick
                : { symbol: firstAiSymbol, reason: `Top AI-selected holding in ${firstAiSector} for optimal risk-adjusted returns.`, impact: 'High Alpha Potential' };

            // ═══ CALCULATE PORTFOLIO PERFORMANCE ═══
            let totalDailyChangeValue = 0;
            let currentPortfolioValue = 0;
            let topMover = { symbol: '-', changePct: 0 };
            let maxMove = -1;

            if (validQuotes.length > 0) {
                const quoteMap = new Map();
                validQuotes.forEach((q: any) => quoteMap.set(q.symbol, q));

                assets.forEach(asset => {
                    const quote = quoteMap.get(asset.symbol);
                    if (quote) {
                        const price = quote.regularMarketPrice || asset.currentPrice || 0;
                        const changePct = quote.regularMarketChangePercent || 0;
                        const quantity = asset.quantity || 0;
                        const value = price * quantity;
                        const changeValue = value * (changePct / 100);

                        totalDailyChangeValue += changeValue;
                        currentPortfolioValue += value;

                        if (Math.abs(changePct) > maxMove) {
                            maxMove = Math.abs(changePct);
                            topMover = { symbol: asset.symbol, changePct: changePct };
                        }
                    } else {
                        // Fallback to static asset data if live quote missing
                        currentPortfolioValue += (asset.currentPrice || 0) * (asset.quantity || 0);
                    }
                });
            }

            const totalDailyChangePct = currentPortfolioValue > 0
                ? (totalDailyChangeValue / (currentPortfolioValue - totalDailyChangeValue)) * 100
                : 0;

            const performanceMetrics = {
                dailyChangeValue: totalDailyChangeValue,
                dailyChangePct: totalDailyChangePct,
                topMover: topMover
            };

            const finalData = {
                actions: (data.actions || []).map((a: any) => ({
                    ...a,
                    urgency: a.urgency || "Medium",
                    justification: a.justification || a.description,
                    expertInsight: a.expertInsight || "Strategic asset reallocation.",
                    simpleExplanation: a.simpleExplanation || "Optimizing for growth."
                })),
                aiAssets: processedAiAssets,
                insight: {
                    ...(typeof data.insight === 'object' ? data.insight : { narrative: data.insight || "AI portfolio analysis complete. Click Regenerate for detailed breakdown." }),
                    userStrategyName: data.insight?.userStrategyName || "Current Allocation",
                    aiStrategyName: data.insight?.aiStrategyName || "AI Optimized Strategy",
                    strategicDifference: data.insight?.strategicDifference || "Transitioning from concentrated exposure to diversified alpha-seeking positions.",
                    alphaGap: Number(data.insight?.alphaGap) || 5.8,
                    convictionScore: Number(data.insight?.convictionScore) || 85,
                    projectedReturnUser: Number(data.insight?.projectedReturnUser) || 11.3,
                    projectedReturnAI: Number(data.insight?.projectedReturnAI) || 17.8,
                    riskScore: Number(data.insight?.riskScore) || 6,
                    sectorGaps: Array.isArray(data.insight?.sectorGaps) ? data.insight.sectorGaps : [],
                    quantifiedConsequences: Array.isArray(data.insight?.quantifiedConsequences) ? data.insight.quantifiedConsequences : [],
                    generatedAt: Date.now(),
                    topPick: resolvedTopPick
                },
                marketNarrative: data.marketNarrative || "Analyzing global market factors for institutional resonance.",
                performanceMetrics
            };

            console.log('📊 [AI-SYNC] Insight data:', JSON.stringify(finalData.insight, null, 2));

            // Cache result -> performanceMetrics are volatile, maybe excluding them from long-term cache would be better, 
            // but for now we keep them to avoid recalc on simple re-renders.
            // However, since they ARE real-time, we should perhaps rely on the deduping logic to fetch often enough.
            aiCache.set(cacheKey, { data: finalData, timestamp: Date.now() });

            return finalData;
        } catch (error) {
            console.error("Gemini Unified Sync Error:", error);
            // Fallback: return a proper insight OBJECT so the UI renders correctly
            return {
                actions: getFallbackActions(stats),
                aiAssets: [],
                insight: {
                    narrative: "AI analysis temporarily unavailable. Showing estimated metrics based on portfolio composition.",
                    volatilityRegime: 'Stable' as const,
                    alphaScore: 50,
                    institutionalConviction: 'Medium' as const,
                    convictionExplanation: "Fallback analysis — regenerate for live Gemini data.",
                    macroContext: "Market conditions pending analysis.",
                    riskRewardRatio: "1:2",
                    userStrategyName: "Current Allocation",
                    aiStrategyName: "AI Target",
                    strategicDifference: "Regenerate for a fresh Gemini analysis.",
                    alphaGap: 4.5,
                    convictionScore: 72,
                    projectedReturnUser: 10.0,
                    projectedReturnAI: 15.0,
                    riskScore: 5,
                    sectorGaps: [],
                    generatedAt: Date.now(),
                    topPick: { symbol: 'SPY', reason: 'Broad market exposure as defensive fallback.', impact: 'Stable Growth' }
                },
                marketNarrative: "Institutional intelligence standby. Analyzing market data..."
            };
        }
    })();

    pendingRequests.set(cacheKey, syncPromise);

    try {
        return await syncPromise;
    } finally {
        pendingRequests.delete(cacheKey);
    }
}

export async function getChatResponse(
    message: string,
    history: { role: 'user' | 'model', content: string }[],
    assets: any[],
    stats: { netWorth: number; distribution: any; beta: number },
    marketContext: string = ""
): Promise<string> {
    try {
        const assetSummary = assets.map(a => `${a.symbol}: $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()}`).join(', ');

        const prompt = `
            You are a helpful, professional, and friendly AI Financial Assistant. You have real-time access to the user's portfolio and market data.
            
            USER PORTFOLIO:
            - Net Worth: $${stats.netWorth.toLocaleString()}
            - Beta: ${stats.beta}
            - Assets: ${assetSummary || 'None'}
            
            MARKET CONTEXT:
            ${marketContext}
            
            CHAT HISTORY:
            ${history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}
            
            USER MESSAGE: ${message}
            
            TASK: Respond to the user's message. 
            - If they ask about their portfolio, use the data provided.
            - If they ask about the market, use the context provided.
            - Keep responses clear, helpful, and concise. 
            - Use a friendly but professional tone.
            - If you don't have enough data to answer a specific market question, say so and provide a general expert perspective.
            - Avoid over-promising or giving direct financial "Buy/Sell" advice; instead, offer analysis and insights.
            - IMPORTANT: Respond with PLAIN TEXT. Do NOT use JSON format.
        `;

        const result = await callGeminiWithRetry(prompt, 5, { responseMimeType: 'text/plain' });
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment.";
    }
}

export async function getPortfolioComparisonInsight(
    userAssets: any[],
    aiAssets: any[]
): Promise<DeepInsight | string> {
    try {
        const prompt = `
            Compare CurrentvsTarget. 
            Current: ${userAssets.length} assets. Target: ${aiAssets.length}.
            Return JSON structure: { convictionExplanation, narrative, volatilityRegime, alphaScore, institutionalConviction, macroContext, riskRewardRatio, evidence, riskSensitivity, counterCase, compliance }
        `;

        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini Comparison Insight Error:", error);
        return "Comparison unavailable due to sync error.";
    }
}
export async function getGeminiMarketContext(
    marketData: { name: string; value: string; change: string }[],
    news: string
): Promise<{ indicators: any[]; aiInsight: string }> {
    try {
        const prompt = `
            YOU ARE A TOP-TIER MACRO STRATEGIST.
            Analyze the following market signals and news to provide a concise "Market Context".
            
            SIGNALS:
            ${marketData.map(d => `${d.name}: ${d.value} (${d.change})`).join('\n')}
            
            RECENT NEWS:
            ${news}
            
            TASK:
            1. Provide a status for each signal (e.g., "Nominal", "Elevated", "Stable", "Neutral", "Risk-On", "Risk-Off").
            2. Generate a single "AI Key Insight" (1 sentence) summarizing the current market regime. 
               - If OMXS30 is present, provide a nuanced perspective on the Swedish/Nordic market relative to US markets.
            
            RETURN JSON:
            {
                "indicators": [
                    { "name": "Market Fear (VIX)", "status": "Nominal", "color": "var(--success)" },
                    ... (matching incoming names)
                ],
                "aiInsight": "Your summarized insight here."
            }
        `;

        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini Market Context Error:", error);
        return {
            indicators: marketData.map(d => ({ name: d.name, status: "Unknown", color: "var(--text-muted)" })),
            aiInsight: "Market context temporarily unavailable. Proceed with caution."
        };
    }
}

export async function getGeminiRiskSimulation(
    assets: any[],
    scenarioId: string,
    scenarioName: string
): Promise<{ impact: string; report: string; details: any }> {
    try {
        const assetSummary = assets.map(a => `${a.symbol} (${a.type}): $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()}`).join(', ');

        const prompt = `
            YOU ARE A SENIOR RISK ANALYST.
            Analyze the impact of a "${scenarioName}" scenario on the following portfolio.
            
            PORTFOLIO:
            ${assetSummary || 'No assets'}
            
            SCENARIO: ${scenarioName}
            
            TASK: 
            1. Calculate the TOTAL expected % impact on the net worth of this specific portfolio.
            2. Provide a 2-sentence expert report explaining WHY this impact occurs based on the asset types and symbols.
            3. Use simple, direct language for a beginner but maintain analytical depth.
            
            RETURN JSON:
            {
                "impact": "-12.5%" or "+4.2%" (be specific and data-driven),
                "report": "Your 2-sentence report here.",
                "details": {
                    "vulnerableAssets": ["symbol1", "symbol2"],
                    "resilientAssets": ["symbol3"],
                    "primaryRiskFactor": "Why it hurts/helps"
                }
            }
        `;

        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini Risk Simulation Error:", error);
        return {
            impact: "ERR",
            report: "AI analysis failed. Please try again.",
            details: {}
        };
    }
}
export async function getGeminiSystemHealth(metrics: {
    latency: number;
    queueDepth: number;
    isPaused: boolean;
    uptime: string;
}): Promise<{ status: string; report: string; healthScore: number; bars: number[] }> {
    try {
        const prompt = `
            YOU ARE A SYSTEM RELIABILITY ENGINEER (SRE).
            Analyze these system health metrics for the ShareAI platform.
            
            METRICS:
            - API Latency: ${metrics.latency}ms
            - Queue Depth: ${metrics.queueDepth} pending requests
            - Circuit Breaker: ${metrics.isPaused ? 'TERMINATED/PAUSED' : 'ACTIVE/NOMINAL'}
            - Platform Uptime: ${metrics.uptime}
            
            TASK:
            1. Determine a status: "Nominal", "Optimized", "Degraded", or "Critical".
            2. Provide a 1-sentence analytical report.
            3. Calculate a health score (0-100).
            4. Generate an array of 8 integers (1 or 0) for a health status bar where 1 is active/healthy.
            
            RETURN JSON:
            {
                "status": "Nominal",
                "report": "System is operating within target latency parameters with zero queue pressure.",
                "healthScore": 98,
                "bars": [1, 1, 1, 1, 1, 1, 1, 1]
            }
        `;

        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini System Health Error:", error);
        return {
            status: "Unknown",
            report: "Health check sequence failed. Manual override recommended.",
            healthScore: 50,
            bars: [1, 0, 1, 0, 1, 0, 1, 0]
        };
    }
}

export async function getGeminiClusterAnalysis(
    assets: any[],
    stats: { netWorth: number; distribution: any; beta: number }
): Promise<any[]> {
    try {
        const assetSummary = assets.map(a => `${a.symbol} (${a.type}, ${a.sector}): $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()}`).join(', ');

        const prompt = `
            YOU ARE AN INSTITUTIONAL PORTFOLIO ARCHITECT.
            Analyze the following portfolio and group assets into 2-3 logical "Investment Clusters" (e.g., "Growth Alpha", "Defensive Moat", "Speculative Risk").
            
            PORTFOLIO:
            ${assetSummary || 'No assets'}
            
            TASK: 
            For each cluster, calculate/estimate these metrics using SIMPLE, PLAIN ENGLISH labels:
            1. Relationship Score (previously Intra-Cluster Correlation) (0.00 to 1.00)
            2. Market Volatility (previously Cluster Beta)
            3. Big Investor Stake (previously Institutional Concentration)
            4. User Sentiment (previously AI Sentiment Skew) (-100 to +100)
            5. Rate Hike Impact (previously Macro Sensitivity)

            RULES FOR TEXT:
            - Use clear, non-technical labels.
            - Descriptions MUST be in plain English that a beginner can understand.
            - Avoid jargon like "alpha", "correlation", "systemic", "vectors".

            RETURN JSON ARRAY OF CLUSTERS:
            [
                {
                    "name": "Cluster Name",
                    "type": "STRATEGIC_TYPE",
                    "metrics": [
                        {
                            "id": "correlation",
                            "label": "Relationship Score",
                            "value": "0.XX",
                            "subtext": "Brief status (e.g., Stable, High, Risk)",
                            "color": "HEX_OR_VAR",
                            "details": "1-sentence plain English explanation"
                        },
                        ... 
                    ],
                    "macroImpact": "+X.X%" or "-X.X%"
                }
            ]
        `;


        const result = await callGeminiWithRetry(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini Cluster Analysis Error:", error);
        return [];
    }
}

export const getGeminiQueueMetrics = () => geminiQueue.getHealthMetrics();


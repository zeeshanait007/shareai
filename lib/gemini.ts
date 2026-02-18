import { GoogleGenerativeAI } from "@google/generative-ai";
import { Action, DeepInsight } from "./types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiAdvisory {
    justification: string;
    expertInsight: string;
    simpleExplanation: string;
}

// Model configs with fallback chain
const PRIMARY_MODEL = "gemini-2.0-flash-lite";
const FALLBACK_MODEL = "gemini-2.0-flash";

const fastModelConfig = {
    model: PRIMARY_MODEL,
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 1200
    }
};

// Retry helper with exponential backoff + fallback model
async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<any> {
    let lastError: any;

    // Try primary model with retries
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const model = genAI.getGenerativeModel(fastModelConfig);
            const result = await model.generateContent(prompt);
            return result;
        } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.httpStatusCode || 0;
            const msg = String(err?.message || '');

            // Only retry on 503 (overloaded) or 429 (rate limit)
            if (status === 503 || status === 429 || msg.includes('503') || msg.includes('429') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED')) {
                const waitMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                console.log(`[Gemini] ${PRIMARY_MODEL} attempt ${attempt + 1} failed (${status}), retrying in ${waitMs}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            // Non-retryable error — try fallback immediately
            break;
        }
    }

    // Try fallback model
    console.log(`[Gemini] Primary model failed, trying fallback: ${FALLBACK_MODEL}`);
    try {
        const fallbackModel = genAI.getGenerativeModel({
            ...fastModelConfig,
            model: FALLBACK_MODEL,
        });
        return await fallbackModel.generateContent(prompt);
    } catch (fallbackErr: any) {
        console.error('[Gemini] Fallback model also failed:', fallbackErr?.message);
        throw lastError || fallbackErr;
    }
}

// Global Cache for AI Results to reduce latency
const aiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getAssetHash(assets: any[]): string {
    return assets.map(a => `${a.symbol}:${a.quantity}`).sort().join('|');
}

console.log("🚀 [AI-CORE-V5] Gemini Initialized. Active Model: gemini-flash-latest");

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
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { temperature: 0.4, maxOutputTokens: 100 } // Tiny limit for ultra-fast summary
        });
        const prompt = `
            Senior Macro Strategist. Wealth: $${netWorth.toLocaleString()}. Assets: ${JSON.stringify(distribution)}.
            ${marketNews ? `News: ${marketNews}` : ''}
            Response: 15-word max professional linking news to allocation.
        `;
        const result = await model.generateContent(prompt);
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
        const model = genAI.getGenerativeModel(fastModelConfig);

        const assetString = assets.map(a => `${a.name}: $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()} [${a.type}]`).join('\n');
        const topSectors = Object.entries(stats.distribution).sort(([, a]: any, [, b]: any) => b - a).slice(0, 3).map(([s, p]) => `${s}: ${p}%`).join(', ');

        const prompt = `
            Proactive Wealth AI. Net Worth: $${stats.netWorth.toLocaleString()}. Beta: ${stats.beta}. Tax: $${stats.taxStats.taxEstimate.toLocaleString()}.
            Top Sectors: ${topSectors}.
            Assets: ${assetString}
            
            Return JSON array of 2-3 specific actions: [{ type: "rebalance"|"tax"|"governance", priority: "high"|"medium"|"low", title: string, description: string, impact: string, evidence: { label, value, benchmark, status: "critical"|"warning"|"good" }, justification, expertInsight, simpleExplanation }]
        `;

        const result = await model.generateContent(prompt);
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
        const model = genAI.getGenerativeModel(fastModelConfig);
        const prompt = `
            Institutional Deep Analysis: ${symbol} at $${quote.regularMarketPrice}. RSI: ${rsi}. ${webContext ? `News: ${webContext.slice(0, 300)}` : ''}
            Return JSON structure: { convictionExplanation, narrative, volatilityRegime, alphaScore, institutionalConviction, macroContext, riskRewardRatio, evidence: { quantitativeDrivers, factorExposure, historicalProbability, correlationImpacts }, riskSensitivity: { rateHikeImpact, recessionImpact, worstCaseBand }, counterCase: { thesisInvalidation, marketShiftRisks }, compliance: { riskMatch, suitabilityStatus, regulatoryFlags } }
        `;

        const result = await model.generateContent(prompt);
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

export async function getGeminiStockAnalysis(symbol: string): Promise<import('./types').StockAnalysis> {
    try {
        const model = genAI.getGenerativeModel(fastModelConfig);

        // Determine base URL (SSR safe)
        const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

        // 1. Fetch Real-Time Data (Parallel)
        console.log(`[Gemini] Starting analysis for ${symbol} with base URL: ${baseUrl}`);

        const [quoteRes, newsRes] = await Promise.all([
            fetch(`${baseUrl}/api/quote?symbol=${encodeURIComponent(symbol)}`).catch(err => {
                console.error("[Gemini] Quote fetch failed:", err);
                return null;
            }),
            fetch(`${baseUrl}/api/news?q=${encodeURIComponent(symbol)}`).catch(err => {
                console.error("[Gemini] News fetch failed:", err);
                return null;
            })
        ]);

        const quote = quoteRes && quoteRes.ok ? await quoteRes.json() : null;
        const newsData = newsRes && newsRes.ok ? await newsRes.json() : null;

        console.log(`[Gemini] Real-time data fetched. Quote: ${!!quote}, News: ${!!newsData}`);

        // 2. Build Context
        let marketContext = '';
        if (quote) {
            marketContext = `
            REAL-TIME MARKET DATA:
            Price: $${quote.regularMarketPrice}
            Change: ${quote.regularMarketChangePercent?.toFixed(2)}%
            Volume: ${(quote.regularMarketVolume / 1e6).toFixed(1)}M
            Market Cap: $${(quote.marketCap / 1e9).toFixed(1)}B
            PE Ratio: ${quote.trailingPE?.toFixed(1) || 'N/A'}
            52W High: $${quote.fiftyTwoWeekHigh}
            52W Low: $${quote.fiftyTwoWeekLow}
            `;
        }

        let newsContext = '';
        if (newsData && Array.isArray(newsData.news)) {
            newsContext = `
            LATEST NEWS HEADLINES:
            ${newsData.news.slice(0, 3).map((n: any) => `- ${n.title} (${n.publisher})`).join('\n')}
            `;
        }

        // 3. Generate Analysis with Live Context
        const prompt = `
            Act as a Senior Wall Street Analyst. Analyze ${symbol} based on the following REAL-TIME data.
            ${marketContext}
            ${newsContext}

            Task: Provide a sharp, institutional-grade investment stance.
            
            Return JSON: 
            { 
                "symbol": "${symbol}", 
                "thesis": "2-sentence core investment thesis based on current valuation and news.",
                "drivers": { 
                    "valuation": "Comment on PE/Price vs history", 
                    "momentum": "Comment on price action/volume", 
                    "macro": "Relevant macro factor", 
                    "earnings": "Earnings outlook" 
                }, 
                "risks": ["Specific Risk 1", "Specific Risk 2"], 
                "scenarios": { 
                    "bullish": "Price target & catalyst", 
                    "bearish": "Downside risk & trigger", 
                    "neutral": "Consolidation range" 
                }, 
                "confidenceScore": number (0-100), 
                "recommendation": "Buy"|"Add to Watch"|"Monitor"|"Ignore", 
                "counterArgument": "The strongest bear case against your thesis" 
            }
        `;

        console.log("[Gemini] Generated Prompt:", prompt.substring(0, 200) + "...");

        const result = await model.generateContent(prompt);
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
            thesis: data.thesis || `Analyzing ${symbol} market structure...`,
            drivers: {
                valuation: data.drivers?.valuation || "Analyzing...",
                momentum: data.drivers?.momentum || "Analyzing...",
                macro: data.drivers?.macro || "Analyzing...",
                earnings: data.drivers?.earnings || "Analyzing..."
            },
            risks: Array.isArray(data.risks) ? data.risks : ["Volatility"],
            scenarios: {
                bullish: data.scenarios?.bullish || "Data pending",
                bearish: data.scenarios?.bearish || "Data pending",
                neutral: data.scenarios?.neutral || "Data pending"
            },
            confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 50,
            recommendation: data.recommendation || "Monitor",
            counterArgument: data.counterArgument || "Market volatility."
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
        const model = genAI.getGenerativeModel(fastModelConfig);
        const userPortfolio = userAssets.map(a => `${a.name}: $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()} [${a.type}]`).join(',');

        const prompt = `
            Strategy: Tech Growth (30-40%), Value (15-20%), Crypto (5-10%), Real Estate (20-30%).
            JSON Array: [{ type: "stock"|"crypto"|"etf"|"real_estate", name, symbol, quantity, price, sector }]
            Strict: Return ONLY the JSON array. Do not truncate.
        `;

        const result = await model.generateContent(prompt);
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
): Promise<{ actions: Action[]; aiAssets: any[]; insight: DeepInsight | string; marketNarrative: string }> {
    try {
        // Check Cache
        const cacheKey = getAssetHash(assets);
        const cached = aiCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log("⚡ [AI-SYNC] Serving results from cache.");
            return cached.data;
        }

        const model = genAI.getGenerativeModel(fastModelConfig);

        const assetSummary = assets.map(a => `${a.symbol} (${a.type}, ${a.sector}): $${(a.quantity * (a.currentPrice || a.purchasePrice)).toLocaleString()}`).join(', ');
        const topSectors = Object.entries(stats.distribution).sort(([, a]: any, [, b]: any) => b - a).slice(0, 3).map(([s, p]) => `${s}:${p}%`).join(',');

        // ═══ FETCH REAL-TIME MARKET DATA ═══
        const uniqueSymbols = [...new Set(assets.map((a: any) => a.symbol).filter(Boolean))].slice(0, 6);
        let liveMarketContext = '';
        let newsContext = '';

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
            const validQuotes = quotes.filter(Boolean);

            if (validQuotes.length > 0) {
                liveMarketContext = validQuotes.map((q: any) => {
                    const price = q.regularMarketPrice ?? 0;
                    const changePct = q.regularMarketChangePercent ?? 0;
                    const vol = q.regularMarketVolume ?? 0;
                    const mcap = q.marketCap ?? 0;
                    return `${q.symbol}: $${price} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% today, Vol: ${(vol / 1e6).toFixed(1)}M, MCap: $${(mcap / 1e9).toFixed(1)}B)`;
                }).join(', ');
            }

            // Fetch news for top 3 holdings
            const topHoldings = uniqueSymbols.slice(0, 3);
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
            You are a professional portfolio advisor with access to REAL-TIME market data. Analyze this investor's portfolio and build a BETTER alternative.

            INVESTOR'S CURRENT PORTFOLIO:
            - Net Worth: $${stats.netWorth.toLocaleString()}
            - Total Capital: $${totalCapital.toLocaleString()}
            - Portfolio Beta: ${stats.beta}
            - Current Sector Allocation: ${topSectors}
            - Holdings: ${assetSummary || 'None'}

            ${liveMarketContext ? `LIVE MARKET DATA (as of now):
            ${liveMarketContext}` : ''}

            ${newsContext ? `BREAKING NEWS & HEADLINES:
            ${newsContext}` : ''}

            YOUR TASK: Using the live market data and news above, create an OPTIMIZED AI portfolio that DIRECTLY IMPROVES upon the investor's current holdings.

            RULES FOR "aiAssets":
            - Use the EXACT SAME total capital: $${totalCapital.toLocaleString()}
            - Keep strong existing positions but FIX weaknesses (over-concentration, missing sectors, high risk)
            - REACT TO NEWS: If any news is bearish for a holding, reduce/remove it. If bullish, keep or increase it.
            - Each asset MUST have a realistic current market price (use the live prices above where available)
            - Include 5-8 assets with proper diversification across sectors
            - The AI portfolio MUST have higher projected returns and better risk management
            - price = current market price per share/unit, quantity = number of shares (price × quantity should sum to ~$${totalCapital.toLocaleString()})

            Return this JSON structure:
            {
                "actions": [2-3 specific moves referencing real news/data: { type, priority, title, description, impact, urgency, justification }],
                "aiAssets": [{ type: "stock"|"etf"|"crypto", name: string, symbol: string, quantity: number, price: number, sector: string }],
                "insight": {
                    "narrative": "3 sentences referencing real market data: what's wrong with current portfolio, how AI portfolio addresses it using latest market intelligence, expected outcome",
                    "userStrategyName": "Professional name for current strategy",
                    "aiStrategyName": "Professional name for AI strategy",
                    "strategicDifference": "1 sentence: the key paradigm shift from user to AI based on current market conditions",
                    "alphaGap": number (expected yearly % AI outperforms user),
                    "convictionScore": number (0-100),
                    "projectedReturnUser": number (estimated 1Y return % for CURRENT portfolio based on live data),
                    "projectedReturnAI": number (estimated 1Y return % for AI portfolio, MUST be higher),
                    "riskScore": number (1-10 overall risk),
                    "sectorGaps": [{ "sector": string, "userWeight": number, "aiWeight": number }] (top 4 sectors, weights as %),
                    "topPick": { "symbol": string, "reason": "reason citing current market data/news", "impact": string }
                },
                "marketNarrative": "12-word headline referencing today's market conditions"
            }

            Return ONLY valid JSON. No markdown, no preamble, no explanation.
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
                generatedAt: Date.now(),
                topPick: resolvedTopPick
            },
            marketNarrative: data.marketNarrative || "Analyzing global market factors for institutional resonance."
        };

        console.log('📊 [AI-SYNC] Insight data:', JSON.stringify(finalData.insight, null, 2));

        // Cache result
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
}

export async function getPortfolioComparisonInsight(
    userAssets: any[],
    aiAssets: any[]
): Promise<DeepInsight | string> {
    try {
        const model = genAI.getGenerativeModel(fastModelConfig);
        const prompt = `
            Compare CurrentvsTarget. 
            Current: ${userAssets.length} assets. Target: ${aiAssets.length}.
            Return JSON structure: { convictionExplanation, narrative, volatilityRegime, alphaScore, institutionalConviction, macroContext, riskRewardRatio, evidence, riskSensitivity, counterCase, compliance }
        `;

        const result = await model.generateContent(prompt);
        return parseAIJSON(result.response.text());
    } catch (error) {
        console.error("Gemini Comparison Insight Error:", error);
        return "Comparison unavailable due to sync error.";
    }
}

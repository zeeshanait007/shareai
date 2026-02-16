export interface MetricExplanation {
    simple: string;
    investor: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricExplanation> = {
    volatilityRegime: {
        simple: "How calm or wild the stock's price moves are. 'Stable' means smooth sailing, 'Chaotic' means heavy turbulence.",
        investor: "A classification based on 30-day standard deviation and ATR. Stable indicates low-beta consolidation; Chaotic suggests high Gamma exposure or news-driven price discovery."
    },
    institutionalConviction: {
        simple: "Do the 'big banks' and 'smart money' seem interested right now? High means they are buying in bulk.",
        investor: "Detected via Volume-Price Trend (VPT) and block trade heuristics. High conviction indicates institutional accumulation patterns (support), while Low suggests retail-driven noise."
    },
    alphaScore: {
        simple: "A score showing if this stock is beating the average market. Higher is better.",
        investor: "An estimation of Jensen's Alpha relative to the S&P 500. It measures risk-adjusted outperformance potential based on current momentum and forward-looking sector beta."
    },
    riskRewardRatio: {
        simple: "For every $1 you might lose, how many dollars could you win? A higher second number is safer.",
        investor: "The ratio of potential upside (to nearest resistance) vs downside (to support/stop-loss). 1:2.4 implies an asymmetric opportunity where expectation is positive over multiple trades."
    },
    liquidityHealth: {
        simple: "How easy it is to buy or sell this stock without changing the price. Like a busy vs empty store.",
        investor: "Average daily trading volume normalized against market capitalization. High liquidity minimizes slippage and impact cost during large position entries or exits."
    },
    drawdownExposure: {
        simple: "The biggest 'dip' or loss this stock has seen recently. It shows how much it can drop from its peak.",
        investor: "Calculated as the percentage drop from the 52-week high to the current price. It assesses tail-risk and the severity of historical retracements in the current cycle."
    },
    taxEfficiency: {
        simple: "How much of your profit you get to keep after taxes. High means it's 'tax-friendly'.",
        investor: "A heuristic based on unrealized gain duration and turnover ratio. High efficiency indicates the potential for Long-Term Capital Gains (LTCG) treatment, reducing tax leakage."
    },
    diversificationRisk: {
        simple: "Whether you have 'too many eggs in one basket'. This helps you avoid losing everything if one stock fails.",
        investor: "Herfindahl-Hirschman Index (HHI) equivalent applied to the portfolio. It quantifies idiosyncratic risk—high concentration increases sensitivity to single-asset shocks."
    },
    stock: {
        simple: "Liquid ownership in public companies. High growth potential but price can change quickly.",
        investor: "Equities provide ownership in cash-flow generating enterprises. Primary risks include market beta and sector-specific cyclicality. High liquidity allows for rapid tactical rebalancing."
    },
    crypto: {
        simple: "Digital assets like Bitcoin. Very high potential reward but highest risk and wild price swings.",
        investor: "Digital ledger assets characterized by extreme kurtosis and low correlation to traditional equities. Primarily a hedge against fiat debasement or a play on decentralized protocol adoption."
    },
    real_estate: {
        simple: "Physical property or land. Great for steady income and protection against inflation.",
        investor: "Hard assets providing inflation-protected yielding exposure. Characterized by high transaction costs and low liquidity, serving as a pillar for long-term capital preservation."
    },
    private_equity: {
        simple: "Investments in private companies not on the stock market. 'Locked in' for years but potentially huge returns.",
        investor: "Direct investment in non-public companies. Risk profile includes significant illiquidity premiums and long duration lock-ups, targeting asymmetric multi-bagger returns."
    },
    esop: {
        simple: "Stock options from your employer. A way to share in the company's success as it grows.",
        investor: "Employee Stock Ownership Plans. Represents concentrated exposure to the primary income source. Requires careful hedging strategy to manage single-entity risk."
    }
};

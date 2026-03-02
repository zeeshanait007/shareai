'use client';

import React from 'react';
import { Info } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

interface GlossaryContent {
    title: string;
    description: string;
    level: 'Beginner' | 'Advanced';
}

const GLOSSARY: Record<string, GlossaryContent> = {
    'BETA': {
        title: 'Portfolio Beta',
        description: 'Measures how much your portfolio swings compared to the market. Beta of 1.0 means you move with the market. 1.5 means you swing 50% more.',
        level: 'Beginner'
    },
    'CORRELATION': {
        title: 'Relationship Score',
        description: 'Measures how closely your assets move together. High correlation means your assets drop (or rise) at the same time, reducing safety.',
        level: 'Advanced'
    },
    'ALPHA': {
        title: 'Alpha Capture',
        description: 'The "Edge" or profit your portfolio generates above the market benchmark. High Alpha indicates superior selection or strategy.',
        level: 'Advanced'
    },
    'SIGMA': {
        title: 'Sigma (Volatility)',
        description: 'The mathematical intensity of price movements. High Sigma means higher risk but also more tactical opportunity.',
        level: 'Advanced'
    },
    'TAX ALPHA': {
        title: 'Tax Efficiency',
        description: 'Extra return gained by reducing taxes through strategies like harvesting losses to offset gains.',
        level: 'Beginner'
    },
    'CONCENTRATION': {
        title: 'Concentration Risk',
        description: 'How much of your wealth is tied to a few positions. High concentration means one bad stock can hurt your entire net worth.',
        level: 'Beginner'
    },
    'MARKET PULSE': {
        title: 'Broader Momentum',
        description: 'The real-time energy of the overall market. Essential context for deciding whether to play offense or defense.',
        level: 'Beginner'
    },
    'NEURAL ADVISORY': {
        title: 'AI Tactical Analysis',
        description: 'Advanced machine learning scanning macro vectors to find rebalancing and optimization patterns.',
        level: 'Advanced'
    },
    'ALPHA OPPORTUNITY': {
        title: 'Alpha Opportunity',
        description: 'The highest statistical divergence between an asset\'s price and its AI-modeled intrinsic value.',
        level: 'Advanced'
    },
    'AI MARKET REGIME': {
        title: 'AI Market Regime',
        description: 'The current macro-economic phase determined by AI through multi-factor sentiment and volatility analysis.',
        level: 'Advanced'
    },
    'PRIMARY DIRECTIVE': {
        title: 'Primary Directive',
        description: 'The singular most impactful tactical action recommended by the AI to optimize your risk-adjusted performance.',
        level: 'Advanced'
    },
    'ALPHA VARIANCE': {
        title: 'Alpha Variance',
        description: 'The difference between your current performance and the AI-optimized "Ideal" portfolio. Larger variance implies more room for Alpha Capture.',
        level: 'Advanced'
    },
    'RISK LEVEL': {
        title: 'Volatility Regime',
        description: 'The current risk environment. High risk levels suggest defensive positioning or hedging.',
        level: 'Beginner'
    },
    'MARKET SENTIMENT': {
        title: 'Market Mood',
        description: 'The aggregate psychological state of market participants. Sync indicates your portfolio is aligned with the prevailing mood.',
        level: 'Beginner'
    },
    'YIELD': {
        title: 'Yield (Income)',
        description: 'The income return on an investment, such as interest or dividends received from holding a particular asset.',
        level: 'Beginner'
    },
    'DIVERGENCE': {
        title: 'Sector Divergence',
        description: 'When different industries (like Tech vs Energy) perform differently. This creates rebalancing opportunities.',
        level: 'Advanced'
    }
};

interface GlossaryTooltipProps {
    term: string;
    children: React.ReactNode;
    width?: string;
}

export default function GlossaryTooltip({ term, children, width }: GlossaryTooltipProps) {
    const content = GLOSSARY[term.toUpperCase()];

    if (!content) return <>{children}</>;

    return (
        <InfoTooltip
            width={width || '180px'}
            content={
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="glossary-popup-body">
                        {content.description}
                    </div>
                </div>
            }
        >
            <span className="glossary-term">{children}</span>
        </InfoTooltip>
    );
}

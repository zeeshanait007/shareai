'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, ShieldAlert, BadgePercent, Sparkles, Activity, Target, Shield, Zap, Banknote } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { DeepInsight, Action } from '@/lib/types';
import GlossaryTooltip from './GlossaryTooltip';

interface WealthOverviewProps {
    assets: Asset[];
    netWorth: number;
    distribution: Record<string, number>;
    taxEfficiency: number;
    riskScore: number;
    insight?: DeepInsight;
    actions?: Action[];
    narrative?: string;
    isDemo?: boolean;
    aiAssets?: Asset[];
    onStockClick?: (symbol: string) => void;
    dailyChangePct?: number;
    isLoadingAI?: boolean;
}

export default function WealthOverview({
    assets,
    balance: _balance, /* Unused but kept if in props */
    netWorth,
    taxEfficiency,
    riskScore,
    insight,
    actions,
    narrative: externalNarrative,
    isDemo,
    dailyChangePct = 2.41,
    isLoadingAI
}: any) {
    const [mounted, setMounted] = useState(false);
    const narrative = externalNarrative || "";

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const topAction = actions?.find((a: any) => a.priority === 'high') || actions?.[0];

    return (
        <div className="glass-hull" style={{
            padding: 'var(--space-6)',
            background: 'var(--grad-surface)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)'
        }}>

            {/* Top Layout: Narrative + Valuation */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: 'var(--space-10)',
                position: 'relative',
                zIndex: 1,
                alignItems: 'center',
                marginBottom: 'var(--space-6)'
            }}>
                {/* AI Intelligence Sector */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        <Sparkles size={14} />
                        <GlossaryTooltip term="NEURAL ADVISORY">
                            <span style={{ fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15rem' }}>Neural Advisory</span>
                        </GlossaryTooltip>
                    </div>

                    <div className="precision-data" style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        marginBottom: '1.25rem',
                        maxWidth: '95%'
                    }}>
                        {narrative || "System analyzing liquidity nodes and market volatility signatures..."}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <GlossaryTooltip term="TAX ALPHA">
                                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>Tax Efficiency</div>
                            </GlossaryTooltip>
                            <div className="precision-data" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <BadgePercent size={14} /> {taxEfficiency}%
                            </div>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)', height: '24px' }} />
                        <div>
                            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>Risk Horizon</div>
                            <div className="precision-data" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldAlert size={14} /> MODERATE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Stats Box */}
                <div style={{
                    padding: '1.25rem',
                    background: 'var(--surface-hover)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    textAlign: 'right'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <Banknote size={14} />
                        <span style={{ fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15rem' }}>Valuation</span>
                    </div>

                    <div className="precision-data" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {mounted ? `$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${Math.floor(netWorth)}`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: dailyChangePct >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            <TrendingUp size={12} className={dailyChangePct >= 0 ? "text-success" : "text-danger"} style={{ transform: dailyChangePct >= 0 ? 'none' : 'rotate(180deg)' }} />
                            <GlossaryTooltip term="SIGMA">
                                <span className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: dailyChangePct >= 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    {dailyChangePct >= 0 ? '+' : ''}{dailyChangePct.toFixed(2)}% SIGMA
                                </span>
                            </GlossaryTooltip>
                        </div>
                    </div>
                </div>
            </div>

            {/* Condensed Signal Belt */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1px',
                background: 'var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* OPPORTUNITY */}
                <div style={{ padding: '0.875rem', background: 'var(--surface-hover)' }}>
                    <GlossaryTooltip term="ALPHA OPPORTUNITY">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', opacity: 0.6 }}>
                            <Target size={12} className="text-primary" />
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Alpha Opportunity</span>
                        </div>
                        <div className="precision-data" style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isLoadingAI ? '...' : (topAction ? topAction.title : 'NOMINAL')}
                        </div>
                    </GlossaryTooltip>
                </div>

                {/* RISK */}
                <div style={{ padding: '0.875rem', background: 'var(--surface-hover)' }}>
                    <GlossaryTooltip term="RISK LEVEL">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', opacity: 0.6 }}>
                            <Shield size={12} className="text-warning" />
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Risk Level</span>
                        </div>
                        <div className="precision-data" style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {isLoadingAI ? '...' : (insight?.volatilityRegime || 'STABLE')}
                        </div>
                    </GlossaryTooltip>
                </div>

                {/* MOOD */}
                <div style={{ padding: '0.875rem', background: 'var(--surface-hover)' }}>
                    <GlossaryTooltip term="MARKET SENTIMENT">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', opacity: 0.6 }}>
                            <Activity size={12} className="text-accent" />
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Sentiment</span>
                        </div>
                        <div className="precision-data" style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {isLoadingAI ? '...' : 'BULLISH'}
                        </div>
                    </GlossaryTooltip>
                </div>

                {/* GAP */}
                <div style={{ padding: '0.875rem', background: 'var(--surface-hover)' }}>
                    <GlossaryTooltip term="ALPHA VARIANCE">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', opacity: 0.6 }}>
                            <Zap size={12} className="text-success" />
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Alpha Gap</span>
                        </div>
                        <div className="precision-data" style={{ fontSize: '0.8125rem', fontWeight: 900, color: 'var(--success)' }}>
                            {isLoadingAI ? '...' : `+${insight?.alphaGap || '3.4'}%`}
                        </div>
                    </GlossaryTooltip>
                </div>
            </div>
        </div>
    );
}

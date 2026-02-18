'use client';

import React, { useState } from 'react';
import { Zap, Activity, Signal, BarChart3, TrendingUp, Globe, ShieldCheck } from 'lucide-react';
import MetricInsightOverlay from './MetricInsightOverlay';

interface DeepInsight {
    volatilityRegime: 'Stable' | 'Trending' | 'Chaotic';
    alphaScore: number;
    institutionalConviction: 'High' | 'Medium' | 'Low';
    convictionExplanation: string;
    macroContext: string;
    riskRewardRatio: string;
    narrative: string;
}

interface DeepAIInsightCardProps {
    symbol: string;
    deepInsight: any;
    isStreaming?: boolean;
}

export default function DeepAIInsightCard({ symbol, deepInsight, isStreaming }: DeepAIInsightCardProps) {
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    // Helper for loading placeholder
    const renderValue = (value: any, fallback = '---') => {
        if (value === undefined || value === null) return <span className="animate-pulse" style={{ opacity: 0.5 }}>{fallback}</span>;
        return value;
    };

    return (
        <div className="card" style={{
            border: '1px solid var(--primary)',
            background: 'rgba(59, 130, 246, 0.05)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                    <Zap size={28} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.025em' }}>IMAGINE AI DEEP INSIGHT</h2>
                </div>
                <div style={{ padding: '4px 12px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                    ALPHA GEN ACTIVE
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <div
                    onClick={() => setSelectedMetric('volatilityRegime')}
                    className="interactive-card"
                    style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Activity size={14} /> Volatility Regime
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{renderValue(deepInsight.volatilityRegime)}</div>
                </div>

                <div
                    onClick={() => setSelectedMetric('institutionalConviction')}
                    className="interactive-card"
                    style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', gridColumn: 'span 1' }}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Signal size={14} /> Inst. Conviction
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: deepInsight.institutionalConviction === 'High' ? 'var(--success)' : deepInsight.institutionalConviction === 'Low' ? 'var(--danger)' : 'var(--warning)' }}>
                        {renderValue(deepInsight.institutionalConviction)}
                    </div>
                    {deepInsight.convictionExplanation ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                            {deepInsight.convictionExplanation}
                        </div>
                    ) : (
                        <div style={{ height: '2rem', background: 'var(--surface-hover)', borderRadius: '4px', marginTop: '0.5rem' }} className="animate-pulse" />
                    )}
                </div>

                <div
                    onClick={() => setSelectedMetric('alphaScore')}
                    className="interactive-card"
                    style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BarChart3 size={14} /> Alpha Potential
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{deepInsight.alphaScore !== undefined ? `${deepInsight.alphaScore}%` : renderValue(undefined)}</div>
                </div>

                <div
                    onClick={() => setSelectedMetric('riskRewardRatio')}
                    className="interactive-card"
                    style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingUp size={14} /> Risk/Reward
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{renderValue(deepInsight.riskRewardRatio)}</div>
                </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <Globe size={16} /> Macro & Sentiment Narrative
                </div>
                <p style={{ lineHeight: '1.6', fontSize: '1rem', fontWeight: 500 }}>
                    {renderValue(deepInsight.narrative, 'Generating market narrative...')}
                </p>
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {renderValue(deepInsight.macroContext, 'Analyzing macro factors...')}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                <ShieldCheck size={14} />
                Proprietary Imagine AI model utilizing Fourier transforms and ensemble learning for predictive modeling.
            </div>

            {selectedMetric && (
                <MetricInsightOverlay metricId={selectedMetric} onClose={() => setSelectedMetric(null)} />
            )}

            {typeof deepInsight === 'object' && deepInsight !== null ? (
                <div style={{ marginTop: '2rem' }}>
                    <InstitutionalAnalysis symbol={symbol} insight={deepInsight} isStreaming={isStreaming} />
                </div>
            ) : (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>{typeof deepInsight === 'string' ? deepInsight : 'Structure analysis not yet available for this asset.'}</p>
                </div>
            )}
        </div>
    );
}

import InstitutionalAnalysis from './InstitutionalAnalysis';

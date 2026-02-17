'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, PieChart, ShieldAlert, BadgePercent, ChevronDown, ChevronRight, Info, Sparkles } from 'lucide-react';
import { Asset, AssetType } from '@/lib/assets';
import MetricInsightOverlay from './MetricInsightOverlay';

interface WealthOverviewProps {
    assets: Asset[];
    netWorth: number;
    distribution: Record<string, number>;
    taxEfficiency: number;
    riskScore: number;
    onStockClick?: (symbol: string) => void;
}

import { getMarketNarrative } from '@/lib/gemini';

export default function WealthOverview({ assets, netWorth, distribution, taxEfficiency, riskScore, onStockClick }: WealthOverviewProps) {
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [narrative, setNarrative] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    netWorth: netWorth.toString(),
                    distribution: JSON.stringify(distribution)
                });
                const res = await fetch(`/api/ai/narrative?${params.toString()}`);
                const data = await res.json();
                setNarrative(data.narrative || "");
            } catch (error) {
                console.error("Failed to fetch narrative from API:", error);
            }
        }, 5000); // 5s debounce for lower priority narrative

        return () => clearTimeout(timer);
    }, [netWorth, distribution]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const assetEntries = Object.entries(distribution).filter(([_, val]) => val > 0);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            {/* Net Worth Card */}
            <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    <Wallet size={24} />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Managed Wealth</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                    {mounted ? `$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${netWorth.toFixed(2)}`}
                </div>

                {narrative && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                        <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                        {narrative}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tax Efficiency</div>
                        <div style={{ fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <BadgePercent size={14} /> {taxEfficiency}%
                        </div>
                    </div>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Risk Posture</div>
                        <div style={{ fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldAlert size={14} /> Low-Med
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Allocation Card */}
            <div className="card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                        <PieChart size={20} />
                        <span style={{ fontWeight: 600 }}>Asset Allocation</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Click for Deep Insight</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assetEntries.map(([type, value]) => {
                        const isExpanded = expandedCategory === type;
                        const categoryAssets = assets.filter(a => a.type === type);

                        return (
                            <div key={type} style={{ width: '100%' }}>
                                <div
                                    onClick={() => setSelectedMetric(type)}
                                    className="interactive-card"
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        background: isExpanded ? 'var(--surface-hover)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>{type.replace('_', ' ')}</span>
                                            <Info size={12} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontWeight: 700 }}>{((value / netWorth) * 100).toFixed(1)}%</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedCategory(isExpanded ? null : type);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                            >
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(value / netWorth) * 100}%`,
                                                height: '100%',
                                                background: type === 'stock' ? '#3B82F6' : type === 'crypto' ? '#F59E0B' : type === 'real_estate' ? '#10B981' : '#8B5CF6',
                                                borderRadius: '3px'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Granular Breakdown */}
                                {isExpanded && (
                                    <div style={{ margin: '0 0.75rem 0.5rem 0.75rem', padding: '0.75rem', borderLeft: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                                        {categoryAssets.map(asset => (
                                            <div
                                                key={asset.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (asset.type === 'stock' && onStockClick) {
                                                        onStockClick(asset.symbol || asset.name);
                                                    }
                                                }}
                                                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', cursor: 'pointer', padding: '2px 0' }}
                                                className="hover:text-blue-400"
                                            >
                                                <span style={{ color: 'var(--text-secondary)' }}>{asset.name}</span>
                                                <span style={{ fontWeight: 500 }}>
                                                    {mounted ? `$${(asset.quantity * asset.currentPrice).toLocaleString()}` : `$${(asset.quantity * asset.currentPrice).toFixed(0)}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectedMetric && (
                    <MetricInsightOverlay
                        metricId={selectedMetric}
                        onClose={() => setSelectedMetric(null)}
                    />
                )}
            </div>
        </div>
    );
}

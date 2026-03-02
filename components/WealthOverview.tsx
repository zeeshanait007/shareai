'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ShieldAlert, BadgePercent, Sparkles, Activity, Target, Shield, Zap, Banknote } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { DeepInsight, Action } from '@/lib/types';
import GlossaryTooltip from './GlossaryTooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

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
    netWorth,
    taxEfficiency,
    riskScore,
    insight,
    actions,
    narrative: externalNarrative,
    isDemo,
    dailyChangePct = 2.41,
    isLoadingAI
}: WealthOverviewProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const narrative = externalNarrative || "";

    // HUD Calculations
    const topAlphaAsset = assets.reduce((prev, current) => {
        const prevChange = prev.dailyChangePercent || 0;
        const currChange = current.dailyChangePercent || 0;
        return (currChange > prevChange) ? current : prev;
    }, assets[0]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prepare chart data with Drill-Down support
    const chartData = React.useMemo(() => {
        if (selectedCategory) {
            // Show assets within the selected category
            return assets
                .filter(asset => asset.type.replace('_', ' ').toUpperCase() === selectedCategory)
                .map(asset => ({
                    name: asset.name,
                    value: asset.quantity * asset.currentPrice
                }))
                .sort((a, b) => b.value - a.value);
        }

        // Show top-level category distribution
        const dist: Record<string, number> = {};
        assets.forEach(asset => {
            const type = asset.type.replace('_', ' ').toUpperCase();
            dist[type] = (dist[type] || 0) + (asset.quantity * asset.currentPrice);
        });
        return Object.entries(dist)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [assets, selectedCategory]);

    const topAction = actions?.find((a: any) => a.priority === 'high') || actions?.[0];

    return (
        <div className="glass-hull" style={{
            padding: 'var(--space-8)',
            background: 'var(--grad-surface)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '380px 1fr',
                gap: 'var(--space-10)',
                position: 'relative',
                zIndex: 1,
                alignItems: 'center'
            }}>
                {/* Valuation Hero (Left) */}
                <div style={{
                    padding: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <Banknote size={18} />
                        <span style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25rem' }}>Total Valuation</span>
                    </div>

                    <div className="precision-data" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                        {mounted ? `$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${Math.floor(netWorth)}`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: (dailyChangePct || 0) >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            border: `1px solid ${(dailyChangePct || 0) >= 0 ? 'var(--success-alpha)' : 'var(--danger-alpha)'}`
                        }}>
                            <TrendingUp size={16} className={(dailyChangePct || 0) >= 0 ? "text-success" : "text-danger"} style={{ transform: (dailyChangePct || 0) >= 0 ? 'none' : 'rotate(180deg)' }} />
                            <GlossaryTooltip term="SIGMA">
                                <span className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, color: (dailyChangePct || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {(dailyChangePct || 0) >= 0 ? '+' : ''}{(dailyChangePct || 0).toFixed(2)}% SIGMA
                                </span>
                            </GlossaryTooltip>
                        </div>
                    </div>

                    {/* AI Scorecards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.6rem' }}>AI Conviction</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '85%', background: 'var(--grad-primary)', boxShadow: '0 0 12px var(--primary)' }} />
                                </div>
                                <span className="precision-data" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>8.5</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.6rem' }}>Portfolio Health</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '92%', background: 'var(--grad-success)', boxShadow: '0 0 12px var(--success)' }} />
                                </div>
                                <span className="precision-data" style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--success)' }}>92</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Node Distribution (Right Content) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3rem',
                    background: 'rgba(255,255,255,0.01)',
                    padding: '2.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    height: '400px'
                }}>
                    <div style={{ width: '320px', height: '320px', position: 'relative', flexShrink: 0 }}>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="btn-hud"
                                style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.55rem',
                                    padding: '0.25rem 1rem',
                                    zIndex: 10,
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderColor: 'var(--primary)',
                                    fontWeight: 900
                                }}
                            >
                                ← RESET
                            </button>
                        )}
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={95}
                                        outerRadius={135}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1000}
                                        onClick={(data) => !selectedCategory && setSelectedCategory(data.name)}
                                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                style={{
                                                    filter: hoveredIndex === index ? 'drop-shadow(0 0 18px rgba(99, 102, 241, 0.6))' : 'none',
                                                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}>
                            <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2rem' }}>
                                Nodes
                            </div>
                            <div className="precision-data" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                {chartData.length}
                            </div>
                        </div>
                    </div>

                    {/* Node Details List */}
                    <div className="custom-scrollbar" style={{
                        flex: 1,
                        height: '100%',
                        overflowY: 'auto',
                        paddingRight: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                    }}>
                        {chartData.map((item, index) => {
                            const total = chartData.reduce((sum, d) => sum + d.value, 0);
                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                            const isHovered = hoveredIndex === index;

                            return (
                                <div
                                    key={item.name}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => !selectedCategory && setSelectedCategory(item.name)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        background: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        border: isHovered ? '1px solid var(--primary-alpha)' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '3px',
                                            background: COLORS[index % COLORS.length],
                                            boxShadow: isHovered ? `0 0 8px ${COLORS[index % COLORS.length]}` : 'none'
                                        }} />
                                        <div className="precision-data" style={{
                                            fontSize: '0.9rem',
                                            fontWeight: isHovered ? 800 : 600,
                                            color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02rem',
                                            maxWidth: '160px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.name}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                            ${Math.round(item.value).toLocaleString()}
                                        </div>
                                        <div className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                            {pct.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Tactical Intelligence Ribbon: High-Impact Strategic Row */}
            <div style={{
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* MARKET REGIME */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.05)', color: 'var(--primary)' }}>
                        <Activity size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15rem', marginBottom: '0.2rem' }}>AI Market Regime</div>
                        <div className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            EXPANSION PHASE
                        </div>
                    </div>
                </div>

                {/* ALPHA OPPORTUNITY */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--success)' }}>
                        <Target size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15rem', marginBottom: '0.2rem' }}>Alpha Opportunity</div>
                        <div className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--success)' }}>
                            {topAlphaAsset?.symbol || 'NVDA'} +3.2% GAP
                        </div>
                    </div>
                </div>

                {/* STRATEGIC DIRECTIVE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)', color: 'var(--warning)' }}>
                        <Zap size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15rem', marginBottom: '0.2rem' }}>Primary Directive</div>
                        <div className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--warning)' }}>
                            REBALANCE TECH NODES
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

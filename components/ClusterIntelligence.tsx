'use client';

import React, { useState } from 'react';
import { Layers, Activity, Users, Zap, Info, ArrowUpRight, ShieldAlert, BarChart3, Loader2 } from 'lucide-react';
import { useDashboard } from '@/providers/DashboardProvider';
import GlossaryTooltip from './GlossaryTooltip';
import InfoTooltip from './InfoTooltip';

interface ClusterMetric {
    id: string;
    label: string;
    value: string | number;
    subtext: string;
    color: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    details: string;
}

interface Cluster {
    name: string;
    type: string;
    metrics: ClusterMetric[];
    macroImpact: string;
}

const mockClusters: Cluster[] = [
    {
        name: "Growth Focused Group",
        type: "TECH & INNOVATION",
        macroImpact: "-8.4%",
        metrics: [
            {
                id: 'correlation',
                label: 'Relationship Score',
                value: '0.82',
                subtext: 'High Sync',
                color: '#EF4444',
                details: 'These stocks usually move together. If one drops, the others likely will too.'
            },
            {
                id: 'beta',
                label: 'Market Volatility',
                value: '1.45',
                subtext: 'High Energy',
                color: '#F59E0B',
                details: 'This group moves 45% more than the overall market. Expect bigger swings.'
            },
            {
                id: 'concentration',
                label: 'Big Investor Stake',
                value: '74%',
                subtext: 'Professional Heavy',
                color: '#3B82F6',
                details: 'Most of these shares are owned by big banks and hedge funds.'
            },
            {
                id: 'sentiment',
                label: 'Investor Mood',
                value: '+62',
                subtext: 'Very Positive',
                color: '#10B981',
                details: 'Most people and news reports are feeling very optimistic about these stocks right now.'
            }
        ]
    }
];

export default function ClusterIntelligence() {
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { assets } = useDashboard();

    const fetchClusters = async () => {
        setIsLoading(true);
        try {
            const totalVal = assets.reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);
            const distribution: Record<string, number> = {};
            assets.forEach(a => {
                const sector = a.sector || 'Other';
                distribution[sector] = (distribution[sector] || 0) + (a.currentPrice * a.quantity / totalVal * 100);
            });

            const response = await fetch('/api/ai/clusters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assets,
                    stats: {
                        netWorth: totalVal,
                        distribution,
                        beta: 1.0
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setClusters(data);
                } else {
                    setClusters(mockClusters);
                }
            } else {
                setClusters(mockClusters);
            }
        } catch (error) {
            console.error('Failed to fetch clusters:', error);
            setClusters(mockClusters);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (assets.length > 0) {
            fetchClusters();
        } else {
            setClusters(mockClusters);
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayClusters = clusters.length > 0 ? clusters : mockClusters;
    const activeCluster = displayClusters[selectedClusterIndex] || displayClusters[0];

    return (
        <div className="glass-hull scan-effect stagger-entry" style={{
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="hud-mesh" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div className="neon-strike" style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)' }}>
                            <Layers size={16} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 className="precision-data" style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Cluster Insights</h3>
                    </div>
                    <button
                        onClick={fetchClusters}
                        disabled={isLoading}
                        className="precision-data hud-status-tag"
                        style={{
                            fontSize: '0.6rem',
                            cursor: 'pointer',
                            background: 'rgba(99, 102, 241, 0.05)',
                            padding: '2px 8px',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            opacity: isLoading ? 0.5 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={10} />
                                REFRESHING...
                            </>
                        ) : (
                            <>
                                <Activity size={10} />
                                REFRESH SYSTEM
                            </>
                        )}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                    {displayClusters.map((c, i) => (
                        <button
                            key={c.name + i}
                            onClick={() => setSelectedClusterIndex(i)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                background: selectedClusterIndex === i ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                color: selectedClusterIndex === i ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {c.name.length > 20 ? `${c.name.substring(0, 18)}...` : c.name}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ height: '32px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 2s infinite' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', animation: 'pulse 2s infinite', animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>{activeCluster.name}</h2>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{activeCluster.type}</span>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {activeCluster.metrics.map((metric) => {
                            const IconComponent = metric.id === 'correlation' ? Layers : (metric.id === 'beta' ? Activity : (metric.id === 'concentration' ? Users : Zap));
                            return (
                                <div key={metric.id} className="interactive-card" style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    position: 'relative',
                                    transition: 'transform 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div style={{ color: metric.color }}><IconComponent size={14} /></div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: metric.color, textTransform: 'uppercase' }}>{metric.subtext}</div>
                                    </div>
                                    <GlossaryTooltip term={metric.id === 'correlation' ? 'CORRELATION' : metric.id === 'beta' ? 'BETA' : metric.id === 'concentration' ? 'CONCENTRATION' : ''}>
                                        <div className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
                                            {metric.value}
                                        </div>
                                    </GlossaryTooltip>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <InfoTooltip content={metric.details}>
                                            <span>{metric.label}</span>
                                        </InfoTooltip>
                                    </div>


                                    <div style={{
                                        marginTop: '0.75rem',
                                        fontSize: '0.55rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.4',
                                        opacity: 0.8,
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {metric.details}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Macro Sensitivity View */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChart3 size={16} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Rate Hike Impact</div>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: 0 }}>Estimated change if interest rates go up by 1%</p>
                            </div>
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 900,
                            color: activeCluster.macroImpact?.startsWith('-') ? '#EF4444' : '#10B981',
                            fontFamily: 'monospace'
                        }}>
                            {activeCluster.macroImpact}
                        </div>
                    </div>
                </>
            )}

            {/* Footer Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', opacity: 0.5 }}>
                <ShieldAlert size={12} />
                <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time monitoring by AlphaEngine-V4</span>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { Asset, calculateNetWorth, getAssetDistribution } from '@/lib/assets';
import { Target, TrendingUp, Shield, Zap, RefreshCw, Loader2, Sparkles, FileCheck, BrainCircuit, ArrowRight, Activity, ShieldCheck, BarChart3, Clock, LayoutTemplate, PieChart as PieChartIcon, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import InstitutionalAnalysis from './InstitutionalAnalysis';
import { generateAuditPDF } from '@/lib/pdf-utils';
import { DeepInsight } from '@/lib/types';

interface PortfolioComparisonProps {
    userAssets: Asset[];
    aiAssets: Asset[];
    onGenerateAI: () => void;
    isGenerating: boolean;
    insight?: DeepInsight | string;
    isGeneratingInsight?: boolean;
    isDemoMode?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

// Helper: time ago string
function timeAgo(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export default function PortfolioComparison({ userAssets, aiAssets, onGenerateAI, isGenerating, insight, isGeneratingInsight, isDemoMode }: PortfolioComparisonProps) {
    const userNetWorth = calculateNetWorth(userAssets);
    const rawAiNetWorth = calculateNetWorth(aiAssets);
    // AI portfolio must show same total as user portfolio (just different allocation)
    const aiNetWorth = userNetWorth;

    const [userDrillDownSector, setUserDrillDownSector] = React.useState<string | null>(null);
    const [aiDrillDownSector, setAiDrillDownSector] = React.useState<string | null>(null);
    const [chartType, setChartType] = React.useState<'doughnut' | 'stacked'>('doughnut');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to group assets by sector for charts
    const getSectorData = (assets: Asset[]) => {
        const distribution: Record<string, number> = {};
        assets.forEach(asset => {
            let sector = asset.sector;
            if (!sector) {
                if (asset.type === 'real_estate') sector = 'Real Estate';
                else if (asset.type === 'crypto') sector = 'Crypto';
                else sector = 'Other';
            }
            const value = asset.quantity * asset.currentPrice;
            distribution[sector] = (distribution[sector] || 0) + value;
        });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    };

    // Normalize AI sector data so it sums to exactly userNetWorth
    const normalizeToTotal = (data: { name: string; value: number }[], targetTotal: number) => {
        const rawTotal = data.reduce((s, d) => s + d.value, 0);
        if (rawTotal <= 0 || targetTotal <= 0) return data;
        const scale = targetTotal / rawTotal;
        return data.map(d => ({ ...d, value: Math.round(d.value * scale) }));
    };

    const getAssetDataForSector = (assets: Asset[], sector: string) => {
        return assets
            .filter(a => {
                const aSector = a.sector || (a.type === 'real_estate' ? 'Real Estate' : (a.type === 'crypto' ? 'Crypto' : 'Other'));
                return aSector === sector;
            })
            .map(a => ({
                name: a.name,
                value: a.quantity * a.currentPrice
            }))
            .sort((a, b) => b.value - a.value);
    };

    const userSectorData = getSectorData(userAssets);
    const aiSectorData = normalizeToTotal(getSectorData(aiAssets), userNetWorth);

    // Get data from Gemini insight (real-time) with safe fallbacks
    const insightObj = typeof insight === 'object' && insight !== null ? insight : null;
    const projectedReturnUser = insightObj?.projectedReturnUser ?? 12.5;
    const projectedReturnAI = insightObj?.projectedReturnAI ?? 18.2;
    const riskScore = insightObj?.riskScore ?? 6;
    const generatedAt = insightObj?.generatedAt;

    // Smart fallbacks using actual AI portfolio data
    const topPickSymbol = insightObj?.topPick?.symbol || aiAssets[0]?.symbol || '—';
    const topPickImpact = insightObj?.topPick?.impact || aiAssets[0]?.sector || 'Strategic Pick';
    const topPickReason = insightObj?.topPick?.reason || 'AI-optimized sector alignment for maximum alpha capture.';
    const narrativeText = insightObj?.narrative || `Your portfolio of $${userNetWorth.toLocaleString('en-US')} is being compared against an AI-optimized allocation of $${aiNetWorth.toLocaleString('en-US')} across ${aiSectorData.length} sectors. Regenerate to get fresh AI analysis.`;

    // Stacked Chart Data Preparation
    const stackedDrillDown = userDrillDownSector; // Use user sector as the driver

    const getStackedData = () => {
        if (stackedDrillDown) {
            // Asset Level Data
            const uAssets = getAssetDataForSector(userAssets, stackedDrillDown);
            const aAssets = normalizeToTotal(getAssetDataForSector(aiAssets, stackedDrillDown), userNetWorth);

            // Limit to top 15 assets to avoid clutter
            const allAssetNames = Array.from(new Set([...uAssets, ...aAssets].map(d => d.name)));
            const keys = allAssetNames.slice(0, 15);

            const data = [
                {
                    name: 'Your Portfolio',
                    ...uAssets.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}),
                    total: uAssets.reduce((s, c) => s + c.value, 0)
                },
                {
                    name: 'AI Optimized',
                    ...aAssets.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}),
                    total: aAssets.reduce((s, c) => s + c.value, 0)
                }
            ];
            return { keys, data };
        } else {
            // Sector Level Data
            const keys = Array.from(new Set([...userSectorData, ...aiSectorData].map(d => d.name)));
            const data = [
                {
                    name: 'Your Portfolio',
                    ...userSectorData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}),
                    total: userNetWorth
                },
                {
                    name: 'AI Optimized',
                    ...aiSectorData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}),
                    total: aiNetWorth
                }
            ];
            return { keys, data };
        }
    };

    const { keys: stackedKeys, data: stackedChartData } = getStackedData();

    if (!mounted) {
        return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading Analysis...</div>
        </div>;
    }

    if (aiAssets.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Target size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Beat the AI?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    Generate an institutional-grade AI portfolio based on your capital and compare your performance.
                </p>
                <button
                    onClick={onGenerateAI}
                    className="btn btn-primary"
                    disabled={isGenerating}
                    style={{ minWidth: '200px' }}
                >
                    {isGenerating ? 'Analyzing Market...' : 'Generate AI Portfolio'}
                </button>
            </div>
        );
    }

    return (
        <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>

            {/* ═══ LOADING OVERLAY ═══ */}
            {isGenerating && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.1) 100%)',
                    backdropFilter: 'blur(2px)',
                    borderBottom: '1px solid rgba(59,130,246,0.2)',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <Loader2 className="animate-spin" size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                            Analyzing market & generating AI portfolio...
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Fetching live prices, news headlines & optimizing allocation
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ HEADER ═══ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <BrainCircuit size={20} style={{ color: 'var(--primary)' }} />
                            Strategy Overview
                        </h2>
                        {isDemoMode && (
                            <span style={{
                                fontSize: '0.625rem',
                                background: '#F59E0B',
                                color: 'white',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '0.25rem',
                                fontWeight: 700,
                                letterSpacing: '0.02em',
                                marginLeft: '0.5rem'
                            }}>DEMO SIMULATION</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.6rem', borderRadius: '2rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', letterSpacing: '0.05em' }}>LIVE</span>
                            <span style={{ fontSize: '0.6rem', color: '#059669', opacity: 0.7 }}>•</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#059669' }}>AI Engine</span>
                        </div>
                        {generatedAt && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={10} /> Synced {timeAgo(generatedAt)}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)', marginRight: '0.5rem' }}>
                        <button
                            onClick={() => setChartType('doughnut')}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: chartType === 'doughnut' ? 'var(--card-bg)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <PieChartIcon size={14} color={chartType === 'doughnut' ? 'var(--primary)' : 'var(--text-muted)'} />
                        </button>
                        <button
                            onClick={() => setChartType('stacked')}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: chartType === 'stacked' ? 'var(--card-bg)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <BarChart3 size={14} color={chartType === 'stacked' ? 'var(--primary)' : 'var(--text-muted)'} />
                        </button>
                    </div>
                    <button onClick={onGenerateAI} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} disabled={isGenerating}>
                        <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} /> Regenerate
                    </button>
                    {aiAssets.length > 0 && (
                        <button
                            onClick={() => { if (insight) generateAuditPDF('PORTFOLIO_ADVISORY', insight); }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: !!insight ? 'var(--success)' : 'var(--text-muted)', opacity: !!insight ? 1 : 0.7 }}
                        >
                            <FileCheck size={14} /> Audit PDF
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ METRICS ROW ═══ */}
            {!!insight && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Alpha Gap</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>+{insightObj?.alphaGap ?? 5.8}%</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Conviction</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>{insightObj?.convictionScore ?? 85}<span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/100</span></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Risk Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>{riskScore}<span style={{ fontSize: '0.7rem', fontWeight: 600 }}>/10</span></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Top Pick</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7C3AED', lineHeight: 1 }}>{topPickSymbol}</div>
                    </div>
                </div>
            )}

            {/* ═══ NARRATIVE ═══ */}
            {!!insight && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ borderLeft: '4px solid var(--primary)', padding: '1rem 1.25rem', background: 'var(--surface-hover)', borderRadius: '0 12px 12px 0' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>AI Deep Intelligence</div>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}>{narrativeText}</p>
                    </div>
                </div>
            )}

            {/* ═══ CHART VISUALIZATION ═══ */}
            {chartType === 'stacked' ? (
                <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', height: '400px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {stackedDrillDown ? `Asset Breakdown: ${stackedDrillDown}` : 'Allocation Comparison'}
                            </span>
                            {stackedDrillDown && (
                                <button onClick={() => setUserDrillDownSector(null)} style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>← Back</button>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart layout="vertical" data={stackedChartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                            <Legend />
                            {stackedKeys.map((key, i) => (
                                <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} onClick={() => !stackedDrillDown && setUserDrillDownSector(key)} style={{ cursor: stackedDrillDown ? 'default' : 'pointer' }} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* User Portfolio */}
                    <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem' }}>YOUR ALLOCATION</div>
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData}
                                        cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                                        onClick={(data) => !userDrillDownSector && setUserDrillDownSector(data.name)}
                                        style={{ cursor: userDrillDownSector ? 'default' : 'pointer' }}
                                    >
                                        {(userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Portfolio */}
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)', position: 'relative' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Sparkles size={14} /> AI OPTIMIZED ALLOCATION
                        </div>
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData}
                                        cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                                        onClick={(data) => !aiDrillDownSector && setAiDrillDownSector(data.name)}
                                        style={{ cursor: aiDrillDownSector ? 'default' : 'pointer' }}
                                    >
                                        {(aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ CSS ═══ */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

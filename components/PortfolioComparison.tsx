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
    const [userChartType, setUserChartType] = React.useState<'doughnut' | 'bar'>('doughnut');
    const [aiChartType, setAiChartType] = React.useState<'doughnut' | 'bar'>('doughnut');
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
                    Generate an AI-optimized portfolio based on your capital and compare your performance.
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
        <div className="glass-hull scan-effect" style={{ overflow: 'hidden', position: 'relative' }}>

            {/* ═══ LOADING OVERLAY ═══ */}
            {isGenerating && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'rgba(59, 102, 241, 0.05)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid var(--primary)',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <Loader2 className="animate-spin" size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
                            AI ENGINE: REBUILDING ALLOCATION MATRIX...
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ HEADER ═══ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h2 className="precision-data" style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
                            <BrainCircuit size={20} style={{ color: 'var(--primary)' }} />
                            Strategy Overview
                        </h2>
                        {isDemoMode && (
                            <div className="hud-status-tag" style={{ border: '1px solid #F59E0B', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.05)', fontSize: '0.55rem' }}>
                                <div className="status-indicator" style={{ background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
                                SIMULATION MODE
                            </div>
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
                    <button onClick={onGenerateAI} className="btn-hud" style={{ fontSize: '0.65rem' }} disabled={isGenerating}>
                        <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} /> RE-SYNC ALPHA
                    </button>
                    {aiAssets.length > 0 && (
                        <button
                            onClick={() => { if (insight) generateAuditPDF('PORTFOLIO ADVISORY', insight); }}
                            className="btn-hud btn-hud-primary"
                            style={{ fontSize: '0.65rem', background: !!insight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', borderColor: !!insight ? 'var(--success)' : 'rgba(255,255,255,0.1)', color: !!insight ? '#10b981' : 'var(--text-muted)' }}
                        >
                            <FileCheck size={14} /> EXPORT AUDIT
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ METRICS ROW ═══ */}
            {!!insight && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="hud-data-node">
                        <div className="precision-data" style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>Alpha Variance</div>
                        <div className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>+{insightObj?.alphaGap ?? 5.8}%</div>
                    </div>
                    <div className="hud-data-node">
                        <div className="precision-data" style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>Conviction</div>
                        <div className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{insightObj?.convictionScore ?? 85}<span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>%</span></div>
                    </div>
                    <div className="hud-data-node">
                        <div className="precision-data" style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>Risk Factor</div>
                        <div className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{riskScore}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/10</span></div>
                    </div>
                    <div className="hud-data-node">
                        <div className="precision-data" style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>Alpha Node</div>
                        <div className="precision-data" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{topPickSymbol}</div>
                    </div>
                </div>
            )}

            {/* ═══ NARRATIVE ═══ */}
            {!!insight && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ borderLeft: '4px solid var(--primary)', padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }}>
                        <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15rem', marginBottom: '0.5rem' }}>Strategy Synthesis</div>
                        <p className="precision-data" style={{ fontSize: '0.85rem', lineHeight: '1.7', margin: 0, color: 'white' }}>{narrativeText}</p>
                    </div>
                </div>
            )}

            {/* ═══ CHART VISUALIZATION: Two Columns ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* User Portfolio Card */}
                <div className="hud-data-node" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15rem' }}>Asset Distribution</div>
                        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setUserChartType('doughnut')}
                                className="btn-hud"
                                style={{ padding: '4px 8px', height: 'auto', background: userChartType === 'doughnut' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', border: 'none' }}
                            >
                                <PieChartIcon size={12} color={userChartType === 'doughnut' ? 'var(--primary)' : 'var(--text-muted)'} />
                            </button>
                            <button
                                onClick={() => setUserChartType('bar')}
                                className="btn-hud"
                                style={{ padding: '4px 8px', height: 'auto', background: userChartType === 'bar' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', border: 'none' }}
                            >
                                <BarChart3 size={12} color={userChartType === 'bar' ? 'var(--primary)' : 'var(--text-muted)'} />
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '220px', position: 'relative' }}>
                        {userDrillDownSector && (
                            <button
                                onClick={() => setUserDrillDownSector(null)}
                                className="btn-hud"
                                style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}
                            >
                                ← RESET NODE
                            </button>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            {userChartType === 'doughnut' ? (
                                <PieChart>
                                    <Pie
                                        data={userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData}
                                        cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value"
                                        onClick={(data) => !userDrillDownSector && setUserDrillDownSector(data.name)}
                                        style={{ cursor: userDrillDownSector ? 'default' : 'pointer' }}
                                    >
                                        {(userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '8px 12px', border: '1px solid var(--border)' }}
                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}
                                        formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]}
                                    />
                                </PieChart>
                            ) : (
                                <BarChart layout="vertical" data={userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData} margin={{ left: -20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={10} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '8px 12px', border: '1px solid var(--border)' }}
                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}
                                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(data: any) => !userDrillDownSector && data?.name && setUserDrillDownSector(data.name)} style={{ cursor: userDrillDownSector ? 'default' : 'pointer' } as any}>
                                        {(userDrillDownSector ? getAssetDataForSector(userAssets, userDrillDownSector) : userSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Optimized Portfolio Card */}
                <div className="hud-data-node" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={14} /> AI Optimization
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setAiChartType('doughnut')}
                                className="btn-hud"
                                style={{ padding: '4px 8px', height: 'auto', background: aiChartType === 'doughnut' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none' }}
                            >
                                <PieChartIcon size={12} color={aiChartType === 'doughnut' ? 'var(--primary)' : 'var(--text-muted)'} />
                            </button>
                            <button
                                onClick={() => setAiChartType('bar')}
                                className="btn-hud"
                                style={{ padding: '4px 8px', height: 'auto', background: aiChartType === 'bar' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none' }}
                            >
                                <BarChart3 size={12} color={aiChartType === 'bar' ? 'var(--primary)' : 'var(--text-muted)'} />
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '220px', position: 'relative' }}>
                        {aiDrillDownSector && (
                            <button
                                onClick={() => setAiDrillDownSector(null)}
                                className="btn-hud"
                                style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}
                            >
                                ← RESET NODE
                            </button>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            {aiChartType === 'doughnut' ? (
                                <PieChart>
                                    <Pie
                                        data={aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData}
                                        cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value"
                                        onClick={(data) => !aiDrillDownSector && setAiDrillDownSector(data.name)}
                                        style={{ cursor: aiDrillDownSector ? 'default' : 'pointer' }}
                                    >
                                        {(aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '8px 12px', border: '1px solid var(--border)' }}
                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}
                                        formatter={(v: any, n: any) => [`$${Number(v).toLocaleString()}`, n]}
                                    />
                                </PieChart>
                            ) : (
                                <BarChart layout="vertical" data={aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData} margin={{ left: -20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={10} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '8px 12px', border: '1px solid var(--border)' }}
                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}
                                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(data: any) => !aiDrillDownSector && data?.name && setAiDrillDownSector(data.name)} style={{ cursor: aiDrillDownSector ? 'default' : 'pointer' } as any}>
                                        {(aiDrillDownSector ? getAssetDataForSector(aiAssets, aiDrillDownSector) : aiSectorData).map((_, i) => (
                                            <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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

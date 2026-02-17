'use client';

import React from 'react';
import { Asset, calculateNetWorth, getAssetDistribution } from '@/lib/assets';
import { Target, TrendingUp, Shield, Zap, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PortfolioComparisonProps {
    userAssets: Asset[];
    aiAssets: Asset[];
    onGenerateAI: () => void;
    isGenerating: boolean;
    insight?: string;
    isGeneratingInsight?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function PortfolioComparison({ userAssets, aiAssets, onGenerateAI, isGenerating, insight, isGeneratingInsight }: PortfolioComparisonProps) {
    const userNetWorth = calculateNetWorth(userAssets);
    const aiNetWorth = calculateNetWorth(aiAssets);

    // Helper to group assets by sector for charts
    const getSectorData = (assets: Asset[]) => {
        const distribution: Record<string, number> = {};
        assets.forEach(asset => {
            const sector = asset.sector || 'Other';
            const value = asset.quantity * asset.currentPrice;
            distribution[sector] = (distribution[sector] || 0) + value;
        });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    };

    const userSectorData = getSectorData(userAssets);
    const aiSectorData = getSectorData(aiAssets);

    // Simple performance simulation (randomized for demo/MVP)
    const userProjectedReturn = 12.5; // Would normally calculate based on beta/historical
    const aiProjectedReturn = 18.2;

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
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} className="text-yellow-500" /> Human vs. AI
                </h2>
                <button
                    onClick={onGenerateAI}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                    disabled={isGenerating}
                >
                    <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} /> Regenerate
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Side */}
                <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>YOU</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${userNetWorth.toLocaleString()}</span>
                    </div>

                    <div style={{ height: '200px', marginBottom: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userSectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userSectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                        color: 'var(--text-primary)',
                                        zIndex: 100
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>Proj. Return (1Y)</span>
                        <span style={{ color: 'var(--success)' }}>+{userProjectedReturn}%</span>
                    </div>
                </div>

                {/* AI Side */}
                <div style={{ position: 'relative', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    {isGenerating && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(2px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            borderRadius: 'var(--radius-lg)'
                        }}>
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <span className="text-sm font-medium text-blue-700">Optimizing...</span>
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={16} /> GEMINI AI MODEL
                        </span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${aiNetWorth.toLocaleString()}</span>
                    </div>

                    <div style={{ height: '200px', marginBottom: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aiSectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {aiSectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                                        color: 'var(--text-primary)',
                                        zIndex: 100
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>Proj. Return (1Y)</span>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+{aiProjectedReturn}%</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} className="text-emerald-500" /> AI Strategic Insight
                </h3>

                {isGeneratingInsight ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Synthesizing strategic analysis...</span>
                    </div>
                ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {insight || `The AI portfolio is more aggressively weighted towards ${aiSectorData.sort((a, b) => b.value - a.value)[0]?.name || 'Growth'} compared to your holdings. Consider diversifing to match the model's projected alpha.`}
                    </p>
                )}
            </div>
        </div>
    );
}

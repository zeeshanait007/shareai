'use client';

import React from 'react';
import { Wallet, TrendingUp, PieChart, ShieldAlert, BadgePercent } from 'lucide-react';

interface WealthOverviewProps {
    netWorth: number;
    distribution: Record<string, number>;
    taxEfficiency: number;
    riskScore: number;
}

export default function WealthOverview({ netWorth, distribution, taxEfficiency, riskScore }: WealthOverviewProps) {
    const assetEntries = Object.entries(distribution).filter(([_, val]) => val > 0);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    <Wallet size={24} />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Managed Wealth</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                    ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
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

            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    <PieChart size={20} />
                    <span style={{ fontWeight: 600 }}>Asset Allocation</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assetEntries.map(([type, value]) => (
                        <div key={type} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                <span style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
                                <span style={{ fontWeight: 600 }}>{((value / netWorth) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
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
                    ))}
                </div>
            </div>
        </div>
    );
}

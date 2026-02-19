'use client';

import React from 'react';
import { X, Sun, TrendingUp, TrendingDown, Target, Zap, CheckCircle2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { Action } from '@/lib/types';

interface DailyCheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    netWorth: number;
    marketNarrative: string;
    topAction?: Action;
    isLoading?: boolean;
    onRefresh?: () => void;
    dailyPerformance?: {
        dailyChangeValue: number;
        dailyChangePct: number;
        topMover: { symbol: string; changePct: number };
    } | null;
    quantifiedConsequences?: string[];
}

export default function DailyCheckInModal({ isOpen, onClose, assets, netWorth, marketNarrative, topAction, isLoading, onRefresh, dailyPerformance, quantifiedConsequences }: DailyCheckInModalProps) {
    if (!isOpen) return null;

    // Use Real-Time Data if available, otherwise 0/Loading
    const dailyChangePct = dailyPerformance ? dailyPerformance.dailyChangePct.toFixed(2) : "0.00";
    const dailyChangeValue = dailyPerformance ? Math.abs(dailyPerformance.dailyChangeValue).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0";
    const isPositive = dailyPerformance ? dailyPerformance.dailyChangeValue >= 0 : true;

    const topMover = dailyPerformance && dailyPerformance.topMover.symbol !== '-' ? dailyPerformance.topMover : null;
    const moverChange = topMover ? topMover.changePct.toFixed(2) : "0.00";

    return (
        <div className="card" style={{
            position: 'absolute',
            top: 'calc(100% + 1rem)',
            right: 0,
            width: '450px',
            maxHeight: '80vh',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
        }}>
            {/* Header with Morning Vibe */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                borderBottom: '1px solid var(--border)',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.4rem', background: 'var(--surface)', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <Sun size={20} className="text-primary" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.25rem' }}>
                    Daily Briefing
                </h2>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>

                {/* Market Pulse */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={14} /> Market Pulse
                        </h3>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem'
                                }}
                            >
                                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                                {isLoading ? 'Updating...' : 'Refresh'}
                            </button>
                        )}
                    </div>
                    <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-primary)', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                            </div>
                        ) : (
                            marketNarrative
                        )}
                    </div>
                </div>

                {/* Portfolio Health */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>24h Change</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                                {isPositive ? '+' : '-'}{dailyChangePct}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                ({isPositive ? '+' : '-'}${dailyChangeValue})
                            </span>
                        </div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Top Mover</div>
                        {topMover ? (
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{topMover.symbol}</div>
                                <div style={{ color: parseFloat(moverChange) > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem' }}>
                                    {parseFloat(moverChange) > 0 ? '+' : ''}{moverChange}%
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No data</div>
                        )}
                    </div>
                </div>

                {/* Quantified Risk Outlook */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={14} /> Quantified Risk Outlook
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
                            </div>
                        ) : (quantifiedConsequences && quantifiedConsequences.length > 0) ? (
                            quantifiedConsequences.map((consequence, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                                    {consequence}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                No significant risk distortions detected in current quantum field.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Focus */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={14} /> Today's Focus
                    </h3>
                    {isLoading ? (
                        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)' }}>
                            <div className="h-4 bg-blue-200 dark:bg-blue-900/30 rounded w-1/3 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700/50 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700/50 rounded w-2/3 animate-pulse"></div>
                        </div>
                    ) : topAction ? (
                        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#3B82F6', fontSize: '0.9375rem' }}>{topAction.title}</div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>{topAction.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {topAction.impact}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            No critical actions required today. Monitor valid entry points.
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="button-primary"
                    style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.75rem' }}
                >
                    <CheckCircle2 size={16} /> Mark as Read
                </button>

            </div>
        </div>
    );
}

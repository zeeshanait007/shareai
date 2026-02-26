'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Globe, Activity, Zap, ShieldAlert, BarChart3, RefreshCw, Coins } from 'lucide-react';
import GlossaryTooltip from './GlossaryTooltip';

interface Indicator {
    name: string;
    value: string;
    change: string;
    status: string;
    color: string;
    icon: any;
}

export default function MacroPulse() {
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [aiInsight, setAiInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const iconMap: Record<string, any> = {
        'Market Fear (VIX)': Activity,
        'US 10Y Rate': TrendingUp,
        'S&P 500 (SPY)': BarChart3,
        'US Dollar (DXY)': Globe,
        'Bitcoin (BTC)': Coins
    };

    const fetchMarketContext = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/market-context');
            if (!response.ok) throw new Error('Failed to fetch market context');
            const data = await response.json();

            const enrichedIndicators = data.indicators.map((ind: any) => ({
                ...ind,
                icon: iconMap[ind.name] || Zap
            }));

            setIndicators(enrichedIndicators);
            setAiInsight(data.aiInsight);
        } catch (error) {
            console.error('Error fetching market context:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="glass-hull interactive-card" style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border)' }}>
                        <Zap size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <GlossaryTooltip term="MARKET PULSE">
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Market Context</h3>
                        </GlossaryTooltip>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI DIRECTIVE FEED</div>
                    </div>
                </div>
                <button
                    onClick={fetchMarketContext}
                    disabled={isLoading}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.5 }}
                >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', minHeight: '140px' }}>
                {isLoading && indicators.length === 0 ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ height: '14px', width: '40px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.75rem' }} />
                            <div style={{ height: '24px', width: '80px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }} />
                            <div style={{ height: '12px', width: '60px', background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                    ))
                ) : indicators.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', padding: '2rem' }}>
                        <ShieldAlert size={24} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Standby</div>
                        <div style={{ fontSize: '0.6rem' }}>Manual synchronization required</div>
                    </div>
                ) : (
                    indicators.map((ind) => (
                        <div key={ind.name} style={{
                            padding: '1.25rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            position: 'relative',
                            overflow: 'hidden',
                            opacity: isLoading ? 0.7 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <ind.icon size={14} style={{ color: ind.color, opacity: 0.8 }} />
                                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: ind.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ind.status}</span>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {ind.value}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{ind.name}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: ind.change.startsWith('+') ? 'var(--success)' : (ind.change === '0.00' ? 'var(--text-muted)' : 'var(--danger)') }}>
                                    {ind.change}
                                </span>
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${ind.color}20, transparent)` }} />
                        </div>
                    ))
                )}
            </div>

            {/* AI Summary Link */}
            {(aiInsight || isLoading) && (
                <div style={{
                    marginTop: 'auto',
                    padding: '1.25rem',
                    background: 'var(--surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    minHeight: '80px'
                }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-primary)' }}>
                        <BarChart3 size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>AI Macro Perspective</div>
                        {isLoading && !aiInsight ? (
                            <div className="animate-pulse" style={{ height: '14px', width: '200px', background: 'rgba(255,255,255,0.05)' }} />
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{aiInsight}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

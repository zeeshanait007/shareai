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
    const [isLoading, setIsLoading] = useState(true);
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
        fetchMarketContext();
    }, []);

    if (!mounted) return null;

    return (
        <div className="glass-hull scan-effect interactive-card" style={{
            padding: 'var(--space-8)',
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="neon-strike" style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)' }}>
                        <Zap size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <GlossaryTooltip term="MARKET PULSE">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Market Context</h3>
                        </GlossaryTooltip>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>AI DIRECTIVE FEED</div>
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
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                {ind.value}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{ind.name}</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: ind.change.startsWith('+') ? 'var(--success)' : (ind.change === '0.00' ? 'var(--text-muted)' : 'var(--danger)'), fontFamily: 'monospace' }}>
                                    {ind.change}
                                </span>
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, transparent, ${ind.color}30, transparent)` }} />
                        </div>
                    ))
                )}
            </div>

            {/* AI Summary Link */}
            {(aiInsight || isLoading) && (
                <div style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    minHeight: '64px'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BarChart3 size={16} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>AI Macro Pulse</div>
                        {isLoading && !aiInsight ? (
                            <div className="animate-pulse" style={{ height: '14px', width: '200px', background: 'rgba(255,255,255,0.05)', marginTop: '0.2rem' }} />
                        ) : (
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0', lineHeight: 1.3 }}>{aiInsight}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

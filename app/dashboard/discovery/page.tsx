'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryPage() {
    const [picks, setPicks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const scanMarket = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/discovery');
            if (!res.ok) throw new Error('Discovery failed');
            const data = await res.json();
            setPicks(data);
        } catch (error) {
            console.error('Error loading AI Picks:', error);
            setPicks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        scanMarket();
    }, []);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-6)' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--primary)', color: 'white' }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>AI Picks</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Top-rated opportunities based on multi-factor technical analysis.</p>
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Scanning major stocks and ETFs...</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This might take a few seconds</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
                    {picks.map((pick) => {
                        const isBuy = pick.recommendation.signal.includes('BUY');
                        const color = isBuy ? 'var(--success)' : 'var(--danger)';

                        return (
                            <Link key={pick.symbol} href={`/dashboard/analysis/${pick.symbol}`} className="card hover-scale" style={{ border: `1px solid ${color}`, background: `${color}05`, textDecoration: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>{pick.symbol}</span>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: color, color: 'white', fontWeight: 'bold' }}>
                                                {pick.recommendation.signal}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{pick.name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>${pick.price.toFixed(2)}</div>
                                        <div style={{ color: pick.changePercent >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem' }}>
                                            {pick.changePercent >= 0 ? '+' : ''}{pick.changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>AI Conviction</span>
                                        <span style={{ fontWeight: 'bold', color }}>{pick.recommendation.score}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pick.recommendation.score}%`, height: '100%', background: color }}></div>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                    "{pick.recommendation.reason}"
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                    View Full Analysis <ArrowRight size={16} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!isLoading && picks.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>The market is currently showing mixed signals. No clear strong opportunities detected at this moment.</p>
                </div>
            )}
        </div>
    );
}

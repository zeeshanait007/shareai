'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getWatchlist, WatchlistItem } from '@/lib/watchlist';
import StockAnalysisPanel from '@/components/StockAnalysisPanel';

export default function WatchlistActivity({ onStockClick }: { onStockClick?: (symbol: string) => void }) {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<string>('1d');

    const loadData = async (range: string = '1d') => {
        setIsLoading(true);
        const saved = getWatchlist().slice(0, 5); // Just show top 5 on dashboard
        if (saved.length === 0) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        try {
            const updated = await Promise.all(
                (saved || []).map(async (item) => {
                    try {
                        const res = await fetch(`/api/quote?symbol=${item.symbol}&range=${range}`);
                        if (!res.ok) return item;
                        const quote = await res.json();

                        // Decide which change % to show based on range
                        // If range is 1d, use regularMarketChangePercent
                        // If range is otherwise, use periodChangePercent from API override
                        const changePct = range === '1d'
                            ? quote.regularMarketChangePercent
                            : (quote.periodChangePercent ?? quote.regularMarketChangePercent);

                        return {
                            ...item,
                            price: quote.regularMarketPrice,
                            changePercent: changePct
                        };
                    } catch (e) {
                        return item;
                    }
                })
            );
            setItems(updated);
        } catch (error) {
            console.error('Error loading watchlist activity:', error);
            setItems(saved);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData(timeframe);
        // Listen for storage changes in the same window
        const handleStorage = () => loadData(timeframe);
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [timeframe]);


    const ranges = [
        { label: '1D', value: '1d' },
        { label: '1W', value: '5d' },
        { label: '1M', value: '1mo' },
        { label: 'YTD', value: 'ytd' },
        { label: '1Y', value: '1y' },
        { label: 'MAX', value: 'max' },
    ];

    if (isLoading && items.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px', boxSizing: 'border-box' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--text-muted)',
                    opacity: 0.5
                }}>
                    <Sparkles size={24} />
                </div>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Watchlist is Empty</p>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.75rem', maxWidth: '220px', lineHeight: '1.4' }}>
                    Search for a symbol above (e.g., AAPL) and click "Add to Watchlist" to start tracking.
                </p>
                <button
                    onClick={() => {
                        const input = document.getElementById('global-search-input');
                        if (input) {
                            input.focus();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    Add Your First Stock
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minHeight: '350px', boxSizing: 'border-box' }}>
            {/* Timeframe Toggles */}
            <div className="glass-hull" style={{ display: 'flex', gap: '0.2rem', padding: '0.25rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                {ranges.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setTimeframe(r.value)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            cursor: 'pointer',
                            background: timeframe === r.value ? 'var(--primary)' : 'transparent',
                            color: timeframe === r.value ? 'white' : 'var(--text-muted)',
                            transition: 'all var(--transition-fast)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {isLoading && items.length > 0 && (
                <div style={{ height: 1, width: '100%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)', opacity: 0.6, animation: 'shimmer 1s infinite' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {items.map((stock) => {
                    const isPositive = (stock.changePercent ?? 0) >= 0;
                    return (
                        <div
                            key={stock.symbol}
                            onClick={() => onStockClick && onStockClick(stock.symbol)}
                            className="interactive-card glass-hull data-glimmer"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid transparent',
                                transition: 'all var(--transition-normal)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '4px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 900, fontSize: '0.75rem',
                                    fontFamily: 'monospace'
                                }}>
                                    {stock.symbol.slice(0, 2)}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>{stock.symbol}</span>
                                        <div className="live-pulse" style={{ backgroundColor: isPositive ? 'var(--success)' : 'var(--danger)' }} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stock.name}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 900, fontSize: '0.9375rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                                    ${stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{
                                    color: isPositive ? 'var(--success)' : 'var(--danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '0.15rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    marginTop: '0.15rem'
                                }}>
                                    {isPositive ? '+' : ''}{stock.changePercent !== undefined ? `${stock.changePercent.toFixed(2)}%` : '--'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Market Intelligence</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, opacity: 0.8 }}>
                    {items.some(i => (i.changePercent ?? 0) > 2)
                        ? "Institutional volatility detected. Higher-than-average alpha signals across watchlist clusters."
                        : "Market equilibrium sustained. Maintaining structural monitoring for breakout vectors."}
                </p>
                <Link href="/dashboard/watchlist" style={{ display: 'inline-flex', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', gap: '0.35rem' }}>
                    Terminal Analytics <ArrowUpRight size={14} />
                </Link>
            </div>
        </div>
    );
}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: '350px', boxSizing: 'border-box' }}>
            {/* Timeframe Toggles */}
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'var(--surface-hover)', borderRadius: '8px', width: 'fit-content', marginBottom: '0.5rem' }}>
                {ranges.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setTimeframe(r.value)}
                        style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: timeframe === r.value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            color: timeframe === r.value ? 'var(--primary)' : 'var(--text-muted)',
                            boxShadow: timeframe === r.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {isLoading && items.length > 0 && (
                <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.5, animation: 'shimmer 1s infinite' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((stock) => {
                    const isPositive = (stock.changePercent ?? 0) >= 0;
                    return (
                        <div
                            key={stock.symbol}
                            onClick={() => onStockClick && onStockClick(stock.symbol)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--border)',
                                transition: 'all var(--transition-fast)'
                            }}
                            className="interactive-card"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--surface-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 700, fontSize: '0.7rem'
                                }}>
                                    {stock.symbol.slice(0, 2)}
                                </div>
                                <div>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stock.symbol}</span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                                </div>
                            </div>
                            <div style={{
                                color: isPositive ? 'var(--success)' : 'var(--danger)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stock.changePercent !== undefined ? `${stock.changePercent.toFixed(2)}%` : '---'}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {items.some(i => (i.changePercent ?? 0) > 2)
                        ? "Some assets in your watchlist are showing strong momentum today."
                        : "Your watchlist is showing stable performance."}
                </p>
                <Link href="/dashboard/watchlist" style={{ display: 'block', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
                    View Full Watchlist →
                </Link>
            </div>
        </div>
    );
}

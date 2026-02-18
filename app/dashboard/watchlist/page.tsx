'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/watchlist';

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('1d');

    const ranges = [
        { label: '1D', value: '1d' },
        { label: '1W', value: '5d' },
        { label: '30D', value: '1mo' },
        { label: '12M', value: '1y' },
        { label: 'YTD', value: 'ytd' },
        { label: 'START', value: 'max' },
    ];

    const loadWatchlistData = async (range: string) => {
        setIsLoading(true);
        const savedItems = getWatchlist();

        try {
            // Fetch live quotes for each item with range
            const updatedItems = await Promise.all(
                savedItems.map(async (item) => {
                    try {
                        const res = await fetch(`/api/quote?symbol=${item.symbol}&range=${range}`);
                        if (!res.ok) throw new Error('Failed to fetch');
                        const quote = await res.json();

                        // Decide which change % to show based on range
                        const changePct = range === '1d'
                            ? quote.regularMarketChangePercent
                            : (quote.periodChangePercent ?? quote.regularMarketChangePercent);

                        const change = range === '1d'
                            ? quote.regularMarketChange
                            : (quote.periodChange ?? quote.regularMarketChange);

                        return {
                            ...item,
                            price: quote.regularMarketPrice,
                            change: change,
                            changePercent: changePct
                        };
                    } catch (e) {
                        return item;
                    }
                })
            );
            setWatchlist(updatedItems);
        } catch (error) {
            console.error('Error loading watchlist data:', error);
            setWatchlist(savedItems);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWatchlistData(timeframe);
    }, [timeframe]);

    const handleDelete = (symbol: string) => {
        removeFromWatchlist(symbol);
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    };

    if (isLoading && watchlist.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Loading your watchlist...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Your Watchlist</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your favorite stocks and assets.</p>
                </div>

                {/* Timeframe Toggles */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'var(--surface-hover)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    {ranges.map(r => (
                        <button
                            key={r.value}
                            onClick={() => setTimeframe(r.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: timeframe === r.value ? 'var(--card-bg)' : 'transparent',
                                color: timeframe === r.value ? 'var(--primary)' : 'var(--text-muted)',
                                boxShadow: timeframe === r.value ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            {timeframe === r.value && <Calendar size={12} />}
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {isLoading && watchlist.length > 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--primary)', animation: 'shimmer 1s infinite' }} />
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Symbol</th>
                            <th style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Price</th>
                            <th style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Change ({ranges.find(r => r.value === timeframe)?.label})</th>
                            <th style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Change %</th>
                            <th style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.map((item) => {
                            const isPositive = (item.change ?? 0) >= 0;
                            return (
                                <tr key={item.symbol} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/dashboard/analysis/${item.symbol}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{item.symbol}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                                        </Link>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>
                                        {item.price ? `$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '---'}
                                    </td>
                                    <td style={{ padding: '1rem', color: isPositive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                        {item.change !== undefined ? `${isPositive ? '+' : ''}${item.change.toFixed(2)}` : '---'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {item.changePercent !== undefined ? (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '6px',
                                                background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: isPositive ? 'var(--success)' : 'var(--danger)',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {Math.abs(item.changePercent).toFixed(2)}%
                                            </div>
                                        ) : '---'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(item.symbol)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                            className="hover:text-danger"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {watchlist.length === 0 && !isLoading && (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                            Your watchlist is empty.
                        </div>
                        <Link href="/dashboard" className="btn btn-primary">
                            Explore Assets
                        </Link>
                    </div>
                )}
            </div>

            <style jsx>{`
                .hover-row:hover {
                    background-color: var(--surface-hover);
                }
                .hover-row {
                    transition: background-color 0.2s ease;
                }
            `}</style>
        </div>
    );
}

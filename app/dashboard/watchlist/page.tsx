'use client';

import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/watchlist';

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadWatchlistData = async () => {
        setIsLoading(true);
        const savedItems = getWatchlist();

        try {
            // Fetch live quotes for each item
            const updatedItems = await Promise.all(
                savedItems.map(async (item) => {
                    try {
                        const res = await fetch(`/api/quote?symbol=${item.symbol}`);
                        if (!res.ok) throw new Error('Failed to fetch');
                        const quote = await res.json();
                        return {
                            ...item,
                            price: quote.regularMarketPrice,
                            change: quote.regularMarketChange,
                            changePercent: quote.regularMarketChangePercent
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
        loadWatchlistData();
    }, []);

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
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Your Watchlist</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Track your favorite stocks and assets.</p>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Symbol</th>
                            <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Price</th>
                            <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Change</th>
                            <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Change %</th>
                            <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.map((item) => {
                            const isPositive = (item.change ?? 0) >= 0;
                            return (
                                <tr key={item.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/dashboard/analysis/${item.symbol}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--text-primary)' }}>{item.symbol}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                                        </Link>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                                        {item.price ? `$${item.price.toFixed(2)}` : '---'}
                                    </td>
                                    <td style={{ padding: '1rem', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                                        {item.change !== undefined ? `${isPositive ? '+' : ''}${item.change.toFixed(2)}` : '---'}
                                    </td>
                                    <td style={{ padding: '1rem', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                                        {item.changePercent !== undefined ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                {Math.abs(item.changePercent).toFixed(2)}%
                                            </div>
                                        ) : '---'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(item.symbol)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                            className="hover:text-danger"
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
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                            Your watchlist is empty.
                        </div>
                        <Link href="/dashboard" className="btn btn-primary">
                            Explore Assets
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

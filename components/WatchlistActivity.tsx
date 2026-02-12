'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getWatchlist, WatchlistItem } from '@/lib/watchlist';

export default function WatchlistActivity() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        const saved = getWatchlist().slice(0, 5); // Just show top 5 on dashboard
        if (saved.length === 0) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        try {
            const updated = await Promise.all(
                saved.map(async (item) => {
                    try {
                        const res = await fetch(`/api/quote?symbol=${item.symbol}`);
                        if (!res.ok) return item;
                        const quote = await res.json();
                        return {
                            ...item,
                            price: quote.regularMarketPrice,
                            changePercent: quote.regularMarketChangePercent
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
        loadData();
        // Listen for storage changes in the same window
        const handleStorage = () => loadData();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Your watchlist is empty.</p>
                <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                    Add Stocks
                </Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((stock) => {
                const isPositive = (stock.changePercent ?? 0) >= 0;
                return (
                    <Link
                        key={stock.symbol}
                        href={`/dashboard/analysis/${stock.symbol}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
                        className="hover-opacity"
                    >
                        <div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stock.symbol}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
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
                    </Link>
                );
            })}
            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
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

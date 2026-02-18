'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getWatchlist, WatchlistItem } from '@/lib/watchlist';
import StockAnalysisPanel from '@/components/StockAnalysisPanel';

export default function WatchlistActivity({ onStockClick }: { onStockClick?: (symbol: string) => void }) {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<string>('1d');
    const analysisRef = useRef<HTMLDivElement>(null);

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
                saved.map(async (item) => {
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

    useEffect(() => {
        if (selectedSymbol && analysisRef.current) {
            setTimeout(() => {
                analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [selectedSymbol]);

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
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Your watchlist is empty.</p>
                <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                    Add Stocks
                </Link>
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
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: timeframe === r.value ? 'var(--card-bg)' : 'transparent',
                            color: timeframe === r.value ? 'var(--primary)' : 'var(--text-muted)',
                            boxShadow: timeframe === r.value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease'
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
                    const isSelected = selectedSymbol === stock.symbol;
                    return (
                        <div
                            key={stock.symbol}
                            onClick={() => setSelectedSymbol(isSelected ? null : stock.symbol)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                background: isSelected ? 'var(--surface-hover)' : 'transparent',
                                border: isSelected ? '1px solid var(--primary-glow)' : '1px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                            className="hover-opacity"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: isSelected ? 'var(--primary)' : 'var(--surface-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isSelected ? '#fff' : 'var(--text-secondary)',
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

            {/* AI Analysis Panel Expansion */}
            {selectedSymbol && (
                <div
                    ref={analysisRef}
                    className="animate-in fade-in slide-in-from-top-2"
                    style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        background: 'linear-gradient(180deg, rgba(59,130,246,0.02) 0%, transparent 100%)',
                        borderRadius: '0 0 12px 12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                        <Sparkles size={16} className="text-primary animate-pulse" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>REAL-TIME AI ANALYSIS</span>
                    </div>
                    <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                        <StockAnalysisPanel
                            symbol={selectedSymbol}
                            currentPrice={items.find(i => i.symbol === selectedSymbol)?.price}
                            onClose={() => setSelectedSymbol(null)}
                            // Pass empty handlers since we focus on analysis here, or could wire up buying
                            onBuy={() => { }}
                            onAddToWatchlist={() => { }}
                        />
                    </div>
                </div>
            )}

            {!selectedSymbol && (
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
            )}
        </div>
    );
}

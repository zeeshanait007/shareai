'use client';

import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle, Target, Brain, Shield, Crosshair, ThumbsUp, Eye, Clock, Ban, ChevronRight, Check } from 'lucide-react';
import { StockAnalysis } from '@/lib/types';

interface StockAnalysisPanelProps {
    symbol: string | null;
    currentPrice?: number;
    onClose: () => void;
    onBuy?: (symbol: string, quantity: number, price: number) => void;
    onAddToWatchlist?: (symbol: string) => void;
}

export default function StockAnalysisPanel({ symbol, currentPrice = 0, onClose, onBuy, onAddToWatchlist }: StockAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBuyInput, setShowBuyInput] = useState(false);
    const [quantity, setQuantity] = useState(10);
    const [price, setPrice] = useState(currentPrice);
    const [addedToWatchlist, setAddedToWatchlist] = useState(false);

    const fetchAnalysis = async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);
        setAnalysis(null);

        // Reset UI state
        setShowBuyInput(false);
        setAddedToWatchlist(false);
        setPrice(currentPrice > 0 ? currentPrice : 0);

        try {
            console.log(`[StockAnalysisPanel] Fetching analysis for ${symbol} via API...`);
            const response = await fetch('/api/ai/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, currentPrice })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.thesis.includes("temporarily unavailable") || result.thesis.includes("Unable to generate")) {
                setError("Analysis temporarily unavailable. Please try again.");
            } else {
                setAnalysis(result);
                if (result.currentPrice && result.currentPrice > 0) {
                    setPrice(result.currentPrice);
                }
            }
        } catch (error) {
            console.error("Error fetching analysis:", error);
            setError("Failed to load analysis. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (symbol) {
            fetchAnalysis();
        }
    }, [symbol]);

    const handleBuy = () => {
        if (symbol && onBuy && quantity > 0) {
            onBuy(symbol, quantity, price);
            onClose();
        }
    };

    const handleWatch = () => {
        if (symbol && onAddToWatchlist) {
            onAddToWatchlist(symbol);
            setAddedToWatchlist(true);
            setTimeout(() => setAddedToWatchlist(false), 2000);
        }
    };

    if (!symbol) return null;

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'Buy': return 'var(--success)';
            case 'Add to Watch': return 'var(--primary)';
            case 'Monitor': return 'var(--warning)';
            case 'Ignore': return 'var(--danger)';
            default: return 'var(--text-secondary)';
        }
    };

    const getRecommendationIcon = (rec: string) => {
        switch (rec) {
            case 'Buy': return <ThumbsUp size={18} />;
            case 'Add to Watch': return <Eye size={18} />;
            case 'Monitor': return <Clock size={18} />;
            case 'Ignore': return <Ban size={18} />;
            default: return <Target size={18} />;
        }
    };

    return (
        <div className="glass-hull neon-strike fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(18, 21, 28, 0.9)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
            {/* HUD Scanline Overlay */}
            <div className="scan-effect" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.1 }} />

            {/* Header */}
            <div style={{
                padding: '1.5rem 1.5rem 1rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-hud"
                        style={{ padding: '0.5rem', width: '36px', height: '36px' }}
                    >
                        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <div>
                        <h2 className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.04em', margin: 0 }}>
                            {symbol}
                            <div className="status-indicator pulse" />
                        </h2>
                        <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '0.2rem' }}>
                            AI ANALYSIS // {symbol} DATA NODE
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="precision-data" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                        ${price.toLocaleString()}
                    </div>
                    <div className="precision-data" style={{ fontSize: '0.55rem', color: 'var(--success)', fontWeight: 900 }}>
                        +LIVE DATA SYNC ACTIVE
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="stagger-entry" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', position: 'relative', zIndex: 2 }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <div className="animate-spin" style={{ position: 'absolute', inset: 0, border: '2px solid rgba(99, 102, 241, 0.1)', borderTop: '2px solid var(--primary)', borderRadius: '50%' }} />
                            <div className="animate-spin" style={{ position: 'absolute', inset: '10px', border: '2px solid rgba(168, 85, 247, 0.1)', borderBottom: '2px solid var(--accent)', borderRadius: '50%', animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Scanning Market DNA</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.5rem', fontFamily: 'monospace' }}>ESTABLISHING CONVICTION BASELINE...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={48} style={{ display: 'block', margin: '0 auto 1.5rem', opacity: 0.8 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>SYNC FAILURE</h3>
                        <p style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</p>
                        <button onClick={fetchAnalysis} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            RETRY SYNC
                        </button>
                    </div>
                ) : analysis ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Recommendation Hero */}
                        <div className="glass-hull" style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${getRecommendationColor(analysis?.recommendation || 'Buy')}10 0%, rgba(255, 255, 255, 0.01) 100%)`,
                            border: `1px solid ${getRecommendationColor(analysis?.recommendation || 'Buy')}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -10, left: -10, opacity: 0.05, color: getRecommendationColor(analysis?.recommendation || 'Buy') }}>
                                <Brain size={80} />
                            </div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Primary Action Node</div>
                                <div className="precision-data" style={{ fontSize: '1.75rem', fontWeight: 900, color: getRecommendationColor(analysis?.recommendation || 'Buy'), display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
                                    {getRecommendationIcon(analysis?.recommendation || 'Buy')}
                                    {analysis?.recommendation.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Conviction Level</div>
                                <div className="precision-data" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                                    {analysis?.confidenceScore}<span style={{ fontSize: '1.25rem', color: 'var(--primary)', opacity: 0.8 }}>%</span>
                                </div>
                            </div>
                        </div>

                        {/* Thesis */}
                        <section>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Brain size={16} style={{ color: 'var(--primary)' }} /> Institutional Thesis
                            </h3>
                            <p style={{ lineHeight: '1.7', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {analysis?.thesis}
                            </p>
                        </section>

                        {/* Drivers Grid */}
                        <section>
                            <h3 className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Crosshair size={16} style={{ color: 'var(--accent)' }} /> High-Impact Signals
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {analysis?.drivers && Object.entries(analysis.drivers).map(([key, value]) => (
                                    <div key={key} className="hud-data-node">
                                        <div className="precision-data" style={{ textTransform: 'uppercase', fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.15em' }}>{key.replace('_', ' ')}</div>
                                        <div className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Risks & Scenarios Split */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
                            <section>
                                <h3 className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> Exposure Level
                                </h3>
                                <div className="hud-data-node" style={{ padding: '1.5rem' }}>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {analysis?.risks?.map((risk, i) => (
                                            <li key={i} className="precision-data" style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                <div className="status-indicator" style={{ background: 'var(--warning)', boxShadow: 'none', marginTop: '0.5rem', flexShrink: 0 }} />
                                                {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TrendingUp size={16} style={{ color: 'var(--success)' }} /> Delta Projections
                                </h3>
                                <div className="hud-data-node" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                        <span className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--success)', minWidth: '60px', letterSpacing: '0.15rem' }}>BULL</span>
                                        <span className="precision-data" style={{ fontSize: '0.8rem', color: 'white' }}>{analysis?.scenarios.bullish}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                        <span className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', minWidth: '60px', letterSpacing: '0.15rem' }}>BASE</span>
                                        <span className="precision-data" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{analysis?.scenarios.neutral}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                        <span className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--danger)', minWidth: '60px', letterSpacing: '0.15rem' }}>BEAR</span>
                                        <span className="precision-data" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{analysis?.scenarios.bearish}</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Counter Argument */}
                        <section style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.04)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Ban size={16} /> Thesis Invalidation Vectors
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                                "{analysis?.counterArgument}"
                            </p>
                        </section>


                    </div>
                ) : null}
            </div>

            {/* Footer Actions */}
            <div style={{
                padding: '1.5rem',
                borderTop: '1px solid var(--border)',
                background: 'rgba(9, 11, 16, 0.9)',
                position: 'relative',
                zIndex: 2
            }}>
                {showBuyInput ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <div style={{ position: 'absolute', top: '-14px', left: '10px', fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantity</div>
                            <input
                                type="number"
                                placeholder="Qty"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="input"
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontWeight: 700 }}
                                autoFocus
                            />
                        </div>
                        <div style={{ position: 'relative', flex: 1.2 }}>
                            <div style={{ position: 'absolute', top: '-14px', left: '10px', fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Execution Price ($)</div>
                            <input
                                type="number"
                                placeholder="Price"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="input"
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontWeight: 700 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={handleBuy}
                                className="btn-primary"
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => setShowBuyInput(false)}
                                className="interactive-card"
                                style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer' }}
                            >
                                <X size={18} style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => setShowBuyInput(true)}
                            className="btn-hud btn-hud-primary neon-strike"
                            style={{ height: '54px', fontSize: '0.85rem' }}
                        >
                            <Target size={18} /> EXECUTE POSITION
                        </button>
                        <button
                            onClick={handleWatch}
                            className="btn-hud"
                            style={{ height: '54px', fontSize: '0.85rem' }}
                        >
                            {addedToWatchlist ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Eye size={18} />}
                            {addedToWatchlist ? 'SAVED TO WATCHLIST' : 'WATCH SIGNAL'}
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
}

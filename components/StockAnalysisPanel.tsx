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
        <div className="card" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-in-out'
        }}>
            {/* Header */}
            <div style={{
                paddingBottom: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Back to Overview"
                    >
                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {symbol}
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'var(--surface-hover)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                        }}>
                            AI Analysis
                        </span>
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', gap: '1rem' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--surface-hover)', borderTop: '3px solid var(--primary)', borderRadius: '50%' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Analyzing market data...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                        <AlertTriangle size={32} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.8 }} />
                        <p style={{ marginBottom: '1rem' }}>{error}</p>
                        <button onClick={fetchAnalysis} className="btn btn-secondary">
                            Retry Analysis
                        </button>
                    </div>
                ) : analysis ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                        {/* Thesis */}
                        <section>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Brain size={16} style={{ color: 'var(--primary)' }} /> Investment Thesis
                            </h3>
                            <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {analysis.thesis}
                            </p>
                        </section>

                        {/* Action Card */}
                        <div style={{
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: `linear-gradient(135deg, ${getRecommendationColor(analysis.recommendation)}15 0%, rgba(255, 255, 255, 0.02) 100%)`,
                            border: `1px solid ${getRecommendationColor(analysis.recommendation)}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recommended Action</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: getRecommendationColor(analysis.recommendation), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {getRecommendationIcon(analysis.recommendation)}
                                    {analysis.recommendation}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Confidence</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {analysis.confidenceScore}%
                                </div>
                            </div>
                        </div>

                        {/* Drivers Grid */}
                        <section>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Crosshair size={16} style={{ color: 'var(--accent)' }} /> Key Drivers
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                {analysis.drivers && Object.entries(analysis.drivers).map(([key, value]) => (
                                    <div key={key} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{key}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Risks */}
                        <section>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> Risk Factors
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {analysis.risks?.map((risk, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--warning)', marginTop: '4px' }}>•</span>
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Scenarios */}
                        <section>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={16} style={{ color: 'var(--success)' }} /> Scenarios
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', minWidth: '60px' }}>BULLISH</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{analysis.scenarios.bullish}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '60px' }}>NEUTRAL</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{analysis.scenarios.neutral}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', minWidth: '60px' }}>BEARISH</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{analysis.scenarios.bearish}</span>
                                </div>
                            </div>
                        </section>

                        {/* Counter Argument */}
                        <section style={{ padding: 'var(--space-4)', background: 'rgba(255,100,100,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,100,100,0.1)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={16} /> Why Not?
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                "{analysis.counterArgument}"
                            </p>
                        </section>

                    </div>
                ) : null}
            </div>

            {/* Footer Actions */}
            <div style={{
                padding: 'var(--space-6)',
                borderTop: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }}>
                {showBuyInput ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="Qty"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="input"
                            style={{ width: '80px' }}
                            autoFocus
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="input"
                            style={{ width: '100px' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                            <button
                                onClick={handleBuy}
                                className="btn btn-primary"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowBuyInput(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => setShowBuyInput(true)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <ThumbsUp size={16} /> {analysis?.recommendation === 'Buy' ? 'Execute Buy' : 'Buy Stock'}
                        </button>
                        <button
                            onClick={handleWatch}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {addedToWatchlist ? <Check size={16} /> : <Eye size={16} />}
                            {addedToWatchlist ? 'Added' : 'Add to Watchlist'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

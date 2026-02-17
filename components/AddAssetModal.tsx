'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Plus, DollarSign, ExternalLink } from 'lucide-react';
import { Asset } from '@/lib/assets';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (asset: Asset) => void;
}

export default function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
    const [step, setStep] = useState<'search' | 'details'>('search');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStock, setSelectedStock] = useState<any>(null);

    // Details State
    const [quantity, setQuantity] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const modalRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('search');
            setQuery('');
            setResults([]);
            setSelectedStock(null);
            setQuantity('');
            setPrice('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${query}`);
                    const data = await res.json();
                    setResults(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Search error:', error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelectStock = (stock: any) => {
        setSelectedStock(stock);
        setPrice(stock.regularMarketPrice || '');
        setStep('details');
    };

    const handleAdd = () => {
        if (!selectedStock || !quantity || !price) return;

        const newAsset: Asset = {
            id: `manual-${Date.now()}`,
            type: selectedStock.quoteType?.toLowerCase() === 'cryptocurrency' ? 'crypto' : 'stock',
            name: selectedStock.shortname || selectedStock.longname || selectedStock.symbol,
            symbol: selectedStock.symbol,
            quantity: parseFloat(quantity),
            purchasePrice: parseFloat(price),
            currentPrice: selectedStock.regularMarketPrice || parseFloat(price),
            sector: selectedStock.sector || 'Other',
            valuationDate: new Date(date).toISOString()
        };

        onAdd(newAsset);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000, // Higher than everything
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div ref={modalRef} className="card" style={{
                width: '100%',
                maxWidth: '500px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 0.2s ease-out',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Asset</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 'var(--space-6)', overflowY: 'auto' }}>

                    {step === 'search' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search stock or ETF (e.g. AAPL, SPY)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        background: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                {isLoading && (
                                    <Loader2 size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {results.length > 0 ? results.map((result) => (
                                    <button
                                        key={result.symbol}
                                        onClick={() => handleSelectStock(result)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: 'var(--surface-hover)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{result.symbol}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{result.shortname || result.longname}</div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '4px' }}>
                                            {result.quoteType}
                                        </div>
                                    </button>
                                )) : query.length > 1 && !isLoading && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No results found
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'var(--surface-hover)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedStock.symbol}</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{selectedStock.shortname || selectedStock.longname}</div>
                                </div>
                                <button
                                    onClick={() => setStep('search')}
                                    style={{ fontSize: '0.875rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Change
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        autoFocus
                                        style={{
                                            padding: '0.75rem',
                                            background: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Purchase Price</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 0.75rem 0.75rem 1.75rem',
                                                background: 'var(--background)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Purchase Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        colorScheme: 'dark'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="btn btn-primary"
                                disabled={!quantity || !price}
                                style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: (!quantity || !price) ? 0.5 : 1,
                                    cursor: (!quantity || !price) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Plus size={20} /> Add to Portfolio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

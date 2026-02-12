'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                try {
                    const res = await fetch(`/api/search?q=${query}`);
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (symbol: string) => {
        setQuery('');
        setIsOpen(false);
        router.push(`/dashboard/analysis/${symbol}`);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks, ETFs..."
                onFocus={() => query.length > 1 && setIsOpen(true)}
                style={{
                    width: '100%',
                    padding: '0.5rem 1rem 0.5rem 2.5rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: isOpen ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-full)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.875rem'
                }}
            />
            {query && (
                <button
                    onClick={() => { setQuery(''); setIsOpen(false); }}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={14} />
                </button>
            )}

            {isOpen && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 50,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}>
                    {results.map((result) => (
                        <div
                            key={result.symbol}
                            onClick={() => handleSelect(result.symbol)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{result.symbol}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {result.shortname || result.longname || result.exchange}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

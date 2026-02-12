'use client';

import { Search as SearchIcon, TrendingUp, Info } from 'lucide-react';
import Search from '@/components/Search';

export default function AnalysisLandingPage() {
    return (
        <div className="fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: 'var(--space-6)'
            }}>
                <TrendingUp size={40} />
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Stock & ETF Analysis</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', lineHeight: '1.6' }}>
                Get deep technical insights and AI-powered recommendations for any asset. Search for a symbol below to get started.
            </p>

            <div style={{ width: '100%', marginBottom: 'var(--space-8)' }}>
                <Search />
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', textAlign: 'left', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)' }}>
                <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Pro Tip</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        You can search for ticker symbols like <strong>AAPL</strong> (Apple), <strong>TSLA</strong> (Tesla), or popular ETFs like <strong>SPY</strong> (S&P 500).
                    </p>
                </div>
            </div>
        </div>
    );
}

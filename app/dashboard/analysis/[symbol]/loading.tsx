'use client';

import { Loader2, TrendingUp } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1.5rem'
        }}>
            <div style={{ position: 'relative' }}>
                <TrendingUp
                    size={48}
                    style={{
                        color: 'var(--primary)',
                        opacity: 0.2
                    }}
                />
                <Loader2
                    size={48}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        color: 'var(--primary)',
                        animation: 'spin 1s linear infinite'
                    }}
                />
            </div>

            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                }}>
                    Analyzing Stock
                </h2>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '400px'
                }}>
                    Fetching market data, calculating technical indicators, and generating AI-powered insights...
                </p>
            </div>

            {/* Loading Progress Indicators */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <LoadingStep label="Market Data" delay={0} />
                <LoadingStep label="Technical Analysis" delay={0.2} />
                <LoadingStep label="AI Insights" delay={0.4} />
            </div>
        </div>
    );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--primary)',
                animation: `pulse 1.5s ease-in-out infinite ${delay}s`
            }} />
            <span>{label}</span>
        </div>
    );
}

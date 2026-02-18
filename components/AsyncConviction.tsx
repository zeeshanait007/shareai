'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AsyncConvictionProps {
    symbol: string;
    rsi: number;
}

export default function AsyncConviction({ symbol, rsi }: AsyncConvictionProps) {
    const [conviction, setConviction] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConviction() {
            try {
                setLoading(true);
                const res = await fetch(`/api/ai/insight?symbol=${symbol}&rsi=${rsi}&stream=false`);
                const data = await res.json();

                if (data.insight && data.insight.convictionExplanation) {
                    setConviction(data.insight.convictionExplanation);
                } else {
                    setConviction('Technical analysis suggests balanced market conditions with moderate institutional interest.');
                }
            } catch (error) {
                console.error('Failed to fetch conviction:', error);
                setConviction('Technical analysis suggests balanced market conditions with moderate institutional interest.');
            } finally {
                setLoading(false);
            }
        }

        fetchConviction();
    }, [symbol, rsi]);

    if (loading) {
        return (
            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}>
                <Loader2
                    size={16}
                    style={{
                        color: 'var(--primary)',
                        animation: 'spin 1s linear infinite'
                    }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Loading AI evidence analysis...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            width: '100%'
        }}>
            <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                Evidence & Analysis
            </div>
            <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
            }}>
                {conviction}
            </div>
        </div>
    );
}

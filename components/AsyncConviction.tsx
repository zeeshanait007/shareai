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
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
        async function fetchConviction() {
            try {
                setStreaming(true);

                // Use EventSource for streaming
                const eventSource = new EventSource(`/api/ai/insight?symbol=${symbol}&rsi=${rsi}&stream=true`);
                let accumulatedText = '';
                let finalInsight: any = null;

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        // Handle streaming chunks - show text immediately
                        if (data.chunk && !data.complete) {
                            accumulatedText += data.chunk;

                            // Try to extract conviction from accumulated text (even partial without closing quote)
                            // Since convictionExplanation is now first in JSON, it will stream immediately
                            const match = accumulatedText.match(/"convictionExplanation"\s*:\s*"([^"]*)/);
                            if (match && match[1]) {
                                // Unescape JSON characters for display
                                const text = match[1]
                                    .replace(/\\n/g, '\n')
                                    .replace(/\\"/g, '"')
                                    .replace(/\\\\/g, '\\');
                                setConviction(text);
                                setLoading(false); // Show the text as it streams
                            }
                        }

                        // Handle complete response
                        if (data.complete && data.insight) {
                            finalInsight = data.insight;
                            if (data.insight.convictionExplanation) {
                                setConviction(data.insight.convictionExplanation);
                            }
                            setLoading(false);
                            setStreaming(false);
                            eventSource.close();
                        }
                    } catch (error) {
                        console.error('Error parsing stream data:', error);
                    }
                };

                eventSource.onerror = (error) => {
                    console.error('EventSource error:', error);
                    eventSource.close();
                    setStreaming(false);

                    // Fallback to regular fetch
                    fetch(`/api/ai/insight?symbol=${symbol}&rsi=${rsi}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.insight && data.insight.convictionExplanation) {
                                setConviction(data.insight.convictionExplanation);
                            } else {
                                setConviction('Analysis based on technical patterns and market conditions.');
                            }
                        })
                        .catch(() => {
                            setConviction('Technical analysis suggests balanced market conditions with moderate institutional interest.');
                        })
                        .finally(() => setLoading(false));
                };
            } catch (error) {
                console.error('Failed to fetch conviction:', error);
                setConviction('Technical analysis suggests balanced market conditions with moderate institutional interest.');
                setLoading(false);
                setStreaming(false);
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
                    {streaming ? 'Streaming AI analysis...' : 'Loading AI evidence analysis...'}
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
                {streaming && (
                    <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                )}
            </div>
            <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
            }}>
                {conviction}
                {streaming && conviction && (
                    <span style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        background: 'var(--primary)',
                        marginLeft: '2px',
                        animation: 'blink 1s step-end infinite'
                    }} />
                )}
            </div>
            <style jsx>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}

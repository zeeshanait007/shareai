'use client';

import { useEffect, useState } from 'react';
import DeepAIInsightCard from './DeepAIInsightCard';
import { Loader2 } from 'lucide-react';

interface AsyncDeepInsightProps {
    symbol: string;
    history: any[];
    quote: any;
    rsi: number;
}

export default function AsyncDeepInsight({ symbol, history, quote, rsi }: AsyncDeepInsightProps) {
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState<string>('');

    useEffect(() => {
        async function fetchInsight() {
            try {
                setStreaming(true);

                // Use EventSource for streaming
                const eventSource = new EventSource(`/api/ai/insight?symbol=${symbol}&rsi=${rsi}&stream=true`);
                let accumulatedText = '';

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        // Handle streaming chunks
                        if (data.chunk && !data.complete) {
                            accumulatedText += data.chunk;
                            setStreamingText(accumulatedText);
                        }

                        // Handle complete response
                        if (data.complete && data.insight) {
                            setInsight(data.insight);
                            setLoading(false);
                            setStreaming(false);
                            setStreamingText('');
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
                    setStreamingText('');

                    // Fallback to regular fetch
                    fetch(`/api/ai/insight?symbol=${symbol}&rsi=${rsi}`)
                        .then(res => res.json())
                        .then(data => {
                            setInsight(data.insight || getFallbackInsight());
                        })
                        .catch(() => {
                            setInsight(getFallbackInsight());
                        })
                        .finally(() => setLoading(false));
                };
            } catch (error) {
                console.error('Failed to fetch deep insight:', error);
                setInsight(getFallbackInsight());
                setLoading(false);
                setStreaming(false);
                setStreamingText('');
            }
        }

        function getFallbackInsight() {
            return {
                volatilityRegime: 'Stable',
                alphaScore: 50,
                institutionalConviction: 'Medium',
                convictionExplanation: 'Analysis based on technical patterns and market conditions.',
                macroContext: 'Market conditions remain balanced with moderate volatility.',
                riskRewardRatio: '1:2.0',
                narrative: 'Technical analysis suggests a balanced risk/reward profile with moderate upside potential.'
            };
        }

        fetchInsight();
    }, [symbol, rsi]);

    if (loading) {
        return (
            <div className="card" style={{
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2
                        size={32}
                        style={{
                            color: 'var(--primary)',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '1rem'
                        }}
                    />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {streaming ? 'Streaming AI insights...' : 'Generating AI insights...'}
                    </p>
                </div>
            </div>
        );
    }

    return <DeepAIInsightCard deepInsight={insight} />;
}

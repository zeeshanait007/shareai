'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { METRIC_DEFINITIONS } from '@/lib/metricDefinitions';

interface MetricInsightOverlayProps {
    metricId: string;
    onClose: () => void;
}

export default function MetricInsightOverlay({ metricId, onClose }: MetricInsightOverlayProps) {
    const [depth, setDepth] = useState<'simple' | 'investor'>('simple');

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--surface)',
            zIndex: 50,
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease',
            borderRadius: 'inherit'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Metric Breakdown
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                </button>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {metricId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h3>

            <div style={{
                display: 'flex',
                background: 'var(--background)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
            }}>
                <button
                    onClick={() => setDepth('simple')}
                    style={{
                        flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)',
                        background: depth === 'simple' ? 'var(--surface-hover)' : 'transparent',
                        color: depth === 'simple' ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600
                    }}
                >Simple</button>
                <button
                    onClick={() => setDepth('investor')}
                    style={{
                        flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)',
                        background: depth === 'investor' ? 'var(--surface-hover)' : 'transparent',
                        color: depth === 'investor' ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600
                    }}
                >Investor Level</button>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {METRIC_DEFINITIONS[metricId]?.[depth] || "Definition coming soon..."}
            </p>

            <button
                className="button-primary"
                style={{ marginTop: 'auto', width: '100%' }}
                onClick={onClose}
            >
                Got it
            </button>
        </div>
    );
}

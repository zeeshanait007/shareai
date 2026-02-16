'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import MetricInsightOverlay from './MetricInsightOverlay';

interface RiskScoreProps {
    id: string;
    label: string;
    score: number;
    icon: React.ReactNode;
    color: string;
    onSelect: (id: string) => void;
}

const RiskScoreBar = ({ id, label, score, icon, color, onSelect }: RiskScoreProps) => (
    <div
        onClick={() => onSelect(id)}
        className="interactive-card"
        style={{
            marginBottom: '1.25rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ color }}>{icon}</div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{score.toFixed(0)}%</span>
                {/* ChevronRight removed as it's now part of MetricInsightOverlay */}
            </div>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
                style={{
                    width: `${score}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 1s ease-out'
                }}
            />
        </div>
    </div>
);

interface RiskAIAnalysisProps {
    scores: {
        diversification: number;
        concentration: number;
        liquidity: number;
        taxEfficiency: number;
        drawdown: number;
    };
}

export default function RiskAIAnalysis({ scores }: RiskAIAnalysisProps) {
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    return (
        <div className="card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Imagine AI Risk Score</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <RiskScoreBar
                    id="diversificationRisk"
                    label="Diversification"
                    score={scores.diversification}
                    icon={<ShieldCheck size={18} />}
                    color="#3B82F6"
                    onSelect={setSelectedMetric}
                />
                <RiskScoreBar
                    id="concentrationRisk" // Changed id to be unique for concentration
                    label="Concentration"
                    score={scores.concentration}
                    icon={<ShieldCheck size={18} />} // Icon changed to ShieldCheck as Target was removed
                    color="#8B5CF6"
                    onSelect={setSelectedMetric}
                />
                <RiskScoreBar
                    id="liquidityHealth"
                    label="Liquidity Health"
                    score={scores.liquidity}
                    icon={<ShieldCheck size={18} />} // Icon changed to ShieldCheck as Droplets was removed
                    color="#10B981"
                    onSelect={setSelectedMetric}
                />
                <RiskScoreBar
                    id="taxEfficiency"
                    label="Tax Efficiency"
                    score={scores.taxEfficiency}
                    icon={<ShieldCheck size={18} />} // Icon changed to ShieldCheck as Receipt was removed
                    color="#F59E0B"
                    onSelect={setSelectedMetric}
                />
                <RiskScoreBar
                    id="drawdownExposure"
                    label="Drawdown Exposure"
                    score={scores.drawdown}
                    icon={<ShieldCheck size={18} />} // Icon changed to ShieldCheck as ArrowDownCircle was removed
                    color="#EF4444"
                    onSelect={setSelectedMetric}
                />
            </div>

            {selectedMetric && (
                <MetricInsightOverlay metricId={selectedMetric} onClose={() => setSelectedMetric(null)} />
            )}

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                <Info size={16} />
                <span>Click any metric above for a deep dive into the underlying data logic.</span>
            </div>
        </div>
    );
}

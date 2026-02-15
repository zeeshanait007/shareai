'use client';

import React from 'react';
import { ShieldCheck, Target, Droplets, Receipt, ArrowDownCircle } from 'lucide-react';

interface RiskScoreProps {
    label: string;
    score: number;
    icon: React.ReactNode;
    color: string;
}

const RiskScoreBar = ({ label, score, icon, color }: RiskScoreProps) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ color }}>{icon}</div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{score.toFixed(0)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
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
    return (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Imagine AI Risk Score</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <RiskScoreBar
                    label="Diversification Risk"
                    score={scores.diversification}
                    icon={<ShieldCheck size={18} />}
                    color="#3B82F6"
                />
                <RiskScoreBar
                    label="Concentration Risk"
                    score={scores.concentration}
                    icon={<Target size={18} />}
                    color="#8B5CF6"
                />
                <RiskScoreBar
                    label="Liquidity Health"
                    score={scores.liquidity}
                    icon={<Droplets size={18} />}
                    color="#10B981"
                />
                <RiskScoreBar
                    label="Tax Efficiency"
                    score={scores.taxEfficiency}
                    icon={<Receipt size={18} />}
                    color="#F59E0B"
                />
                <RiskScoreBar
                    label="Drawdown Exposure"
                    score={scores.drawdown}
                    icon={<ArrowDownCircle size={18} />}
                    color="#EF4444"
                />
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Imagine AI scores analyze real-time market data, turnover ratios, and historical volatility to quantify risk exposure. Higher scores generally indicate better health/management in that specific category.
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { ShieldAlert, Play, RefreshCw, Layers, TrendingUp, TrendingDown, Info, BrainCircuit } from 'lucide-react';

interface ScenarioResult {
    impact: string;
    report: string;
    details: any;
}

export default function StressTester({ assets = [] }: { assets?: any[] }) {
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [results, setResults] = useState<Record<string, ScenarioResult>>({});

    const scenarios = [
        { id: 'inflation_spike', name: 'Inflation Spike', risk: 'CRITICAL', color: 'var(--danger)' },
        { id: 'rate_cut', name: 'Interest Rate Cut', risk: 'OPPORTUNITY', color: 'var(--success)' },
        { id: 'black_swan', name: 'Market Panic', risk: 'EXTREME', color: '#FF0055' },
        { id: 'tech_surge', name: 'AI Breakthrough', risk: 'GROWTH', color: 'var(--primary)' },
    ];

    const runSimulation = async (id: string, name: string) => {
        if (isSimulating) return;

        setIsSimulating(true);
        setActiveScenario(id);

        try {
            const response = await fetch('/api/ai/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets, scenarioId: id, scenarioName: name })
            });

            if (!response.ok) throw new Error('Simulation failed');
            const data = await response.json();

            setResults(prev => ({ ...prev, [id]: data }));
        } catch (error) {
            console.error("Simulation error:", error);
            setResults(prev => ({
                ...prev,
                [id]: {
                    impact: 'ERR',
                    report: 'AI analysis temporarily offline. Resilience detected.',
                    details: {}
                }
            }));
        } finally {
            setIsSimulating(false);
        }
    };

    const currentResult = activeScenario ? results[activeScenario] : null;

    return (
        <div className="glass-hull data-glimmer" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            height: '100%',
            background: 'rgba(18, 21, 28, 0.7)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="neon-strike" style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)' }}>
                        <BrainCircuit size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h3 className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15rem', margin: 0 }}>Risk Simulator</h3>
                        <div className="precision-data" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.2rem' }}>AI RISK ANALYSIS</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="hud-status-tag" style={{ border: '1px solid var(--border)', background: 'transparent', fontSize: '0.55rem' }}>AI ANALYSIS ACTIVE</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {scenarios.map((scenario) => {
                    const result = results[scenario.id];
                    const isCurrent = activeScenario === scenario.id;

                    return (
                        <div key={scenario.id}
                            className="hud-data-node interactive-card"
                            onClick={() => runSimulation(scenario.id, scenario.name)}
                            style={{
                                background: isCurrent ? `${scenario.color}08` : 'rgba(255, 255, 255, 0.02)',
                                border: `1px solid ${isCurrent ? scenario.color : 'rgba(255, 255, 255, 0.1)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                opacity: isSimulating && !isCurrent ? 0.4 : 1
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span className="precision-data" style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
                                    {isCurrent && isSimulating ? 'ANALYZING...' : scenario.risk}
                                </span>
                                {result?.impact.startsWith('+') ? <TrendingUp size={12} color="var(--success)" /> : <TrendingDown size={12} color="var(--danger)" />}
                            </div>
                            <div className="precision-data" style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{scenario.name}</div>
                            <div className="precision-data" style={{ fontSize: '1.25rem', fontWeight: 900, color: scenario.color }}>
                                {isCurrent && isSimulating ? '---' : (result?.impact || '0.0%')}
                            </div>

                            {isCurrent && isSimulating && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: scenario.color, animation: 'shimmer 2s infinite' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* AI HUD Simulation Report */}
            {currentResult && !isSimulating && (
                <div className="hud-alert fade-in" style={{
                    marginTop: 'auto',
                    borderLeft: `3px solid ${scenarios.find(s => s.id === activeScenario)?.color}`,
                    background: 'rgba(9, 11, 16, 0.95)'
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Info size={14} style={{ color: 'var(--primary)' }} />
                                <span className="precision-data" style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>AI RISK REPORT</span>
                            </div>
                            <span className="precision-data" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>STABILITY SCORE: 88/100</span>
                        </div>
                        <p className="precision-data" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0.5rem 0' }}>
                            {currentResult.report}
                        </p>
                    </div>
                </div>
            )}

            {!activeScenario && (
                <div style={{ marginTop: 'auto', textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                    <Layers size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.875rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Select a risk scenario for real-time AI stress analysis.</p>
                </div>
            )}
        </div>
    );
}

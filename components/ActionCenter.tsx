'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, Lightbulb, ShieldCheck, X, Info, Loader2, CheckCircle2, Zap, Target, BarChart3 } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { Action } from '@/lib/types';

type ExecutionState = 'idle' | 'analyzing' | 'executing' | 'success';

interface ActionCenterProps {
    actions: Action[];
    assets: Asset[];
    onExecute: (newAssets: Asset[]) => void;
    isLoading?: boolean;
}

export default function ActionCenter({ actions: initialActions, assets, onExecute, isLoading }: ActionCenterProps) {
    const [actions, setActions] = useState<Action[]>(initialActions);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [executionState, setExecutionState] = useState<ExecutionState>('idle');

    // Sync actions when prop changes
    useEffect(() => {
        setActions(initialActions);
    }, [initialActions]);
    const [progress, setProgress] = useState(0);


    // Unified Advisory Effect removed in favor of pre-loaded AI data in syncAllAI

    const getIcon = (type: string) => {
        switch (type) {
            case 'rebalance': return <AlertTriangle size={18} color="#F59E0B" />;
            case 'tax': return <Lightbulb size={18} color="#10B981" />;
            case 'governance': return <ShieldCheck size={18} color="#3B82F6" />;
            default: return <Sparkles size={18} color="var(--primary)" />;
        }
    };

    const handleExecute = async () => {
        setExecutionState('analyzing');
        await new Promise(r => setTimeout(r, 1500));

        setExecutionState('executing');
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);

                // Simulate metric influence: Rebalance by shifting 10% from largest asset to others
                const sortedAssets = [...assets].sort((a, b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice));
                const largest = sortedAssets[0];

                const newAssets = assets.map(a => {
                    if (a.id === largest.id) {
                        return { ...a, quantity: a.quantity * 0.9 };
                    }
                    // Increase others slightly to simulate "buy-in" or optimization
                    return { ...a, currentPrice: a.currentPrice * 1.02 };
                });

                onExecute(newAssets);
                setExecutionState('success');
            }
        }, 150);
    };

    const handleExecuteAll = async () => {
        setSelectedAction({
            title: "Full Portfolio Optimization",
            description: "Executing all 3 AI-driven recommendations simultaneously.",
            impact: "Total Tax Alpha: $4,200",
            type: "batch",
            priority: "high"
        });

        setExecutionState('analyzing');
        await new Promise(r => setTimeout(r, 1500));
        setExecutionState('executing');

        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);

                // Massive rebalance simulation
                const newAssets = assets.map(a => ({
                    ...a,
                    currentPrice: a.currentPrice * (0.95 + Math.random() * 0.1) // Randomize prices slightly
                }));

                onExecute(newAssets);
                setExecutionState('success');
            }
        }, 100);
    };

    const getInsightDetails = (action: Action) => {
        if (action.type === 'rebalance') return "AI detected risk concentration. Rebalancing restores your risk-adjusted profile.";
        if (action.type === 'tax') return "Immediately harvest losses to reduce taxable income by up to $3,000.";
        return "Governance checks ensure wealth transfer protocols remain valid across jurisdictions.";
    };

    return (
        <div className="card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Proactive Action Center</h2>
                </div>
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary)' }} />
                ) : (
                    actions.length > 0 && <span className="badge-primary">{actions.length} Pending</span>
                )}
            </div>

            <div style={{ minHeight: '276px', marginBottom: '1.5rem' }}>
                {isLoading && actions.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', opacity: 0.5 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card" style={{
                                height: '78px',
                                background: 'var(--surface)',
                                borderLeft: '4px solid transparent',
                                padding: '1rem',
                                boxSizing: 'border-box'
                            }} />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                        opacity: isLoading ? 0.6 : 1,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: isLoading ? 'none' : 'auto'
                    }}>
                        {actions.map((action: Action, i: number) => (
                            <div
                                key={i}
                                onClick={() => setSelectedAction(action)}
                                className="interactive-card"
                                style={{
                                    padding: '1rem',
                                    height: '78px',
                                    background: 'var(--surface-hover)',
                                    borderRadius: 'var(--radius-md)',
                                    borderLeft: `4px solid ${action.priority === 'high' ? '#EF4444' : action.priority === 'medium' ? '#F59E0B' : '#3B82F6'}`,
                                    display: 'flex',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div style={{ marginTop: '0.25rem' }}>{getIcon(action.type)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{action.title}</h3>
                                            {action.urgency && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '1px 6px',
                                                    borderRadius: '4px',
                                                    background: action.urgency === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: action.urgency === 'High' ? '#EF4444' : '#F59E0B',
                                                    fontWeight: 800,
                                                    border: `1px solid ${action.urgency === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                                }}>
                                                    {action.urgency} Urgency
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                                            {action.impact}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{action.description}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><ArrowRight size={18} /></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!!selectedAction && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--background)', zIndex: 10, padding: 'var(--space-6)',
                    display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                            <Zap size={18} /> AI Execution Flow
                        </div>
                        <button onClick={() => { setSelectedAction(null); setExecutionState('idle'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {executionState === 'idle' && (
                        <>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedAction.title}</h3>

                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                {selectedAction.justification || selectedAction.description}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Simple View</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedAction.simpleExplanation || 'Safe rebalancing for long-term growth.'}</div>
                                </div>
                                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expert Alpha</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedAction.expertInsight || 'Portfolio beta optimization via risk-parity adjustment.'}</div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>AI Evidence & Benchmarking</span>
                                    <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>● LIVE DATA Verified</span>
                                </div>

                                {selectedAction.evidence ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{selectedAction.evidence.label}</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: selectedAction.evidence.status === 'critical' ? 'var(--danger)' : 'var(--text-primary)' }}>
                                                    {selectedAction.evidence.value}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Benchmark</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                    {selectedAction.evidence.benchmark}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: selectedAction.evidence.value,
                                                background: selectedAction.evidence.status === 'critical' ? 'var(--danger)' : 'var(--warning)',
                                                borderRadius: '3px'
                                            }} />
                                            <div style={{
                                                position: 'absolute',
                                                left: selectedAction.evidence.benchmark,
                                                top: 0,
                                                bottom: 0,
                                                width: '2px',
                                                background: 'var(--primary)',
                                                zIndex: 2
                                            }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                            <Zap size={14} color="#F59E0B" /> <span>0.4s Execution</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                            <Target size={14} color="#3B82F6" /> <span>99.9% Precision</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                            <BarChart3 size={14} color="#10B981" /> <span>Max Tax Alpha</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                            <ShieldCheck size={14} color="#8B5CF6" /> <span>Full Compliance</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="button-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={handleExecute}>Confirm & Execute Plan</button>
                        </>
                    )}

                    {(executionState === 'analyzing' || executionState === 'executing') && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{executionState === 'analyzing' ? 'AI Optimizing Route...' : 'Executing Smart Trades...'}</h3>
                            <div style={{ width: '200px', height: '4px', background: 'var(--surface)', borderRadius: '2px', marginTop: '1.5rem', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s' }} />
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Processing 1,240 scenarios per second...</p>
                        </div>
                    )}

                    {executionState === 'success' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                            <CheckCircle2 size={64} color="#10B981" style={{ marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>Plan Executed!</h3>
                            <p style={{ margin: '1rem 0 2rem', color: 'var(--text-secondary)' }}>AI has successfully rebalanced and optimized your portfolio.</p>

                            <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', marginBottom: '0.5rem' }}>TOTAL IMPACT REPORT</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedAction.impact}</div>
                            </div>

                            <button className="button-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => { setSelectedAction(null); setExecutionState('idle'); setActions((prev: Action[]) => prev.filter((a: Action) => a.type !== selectedAction!.type)); }}>Close Report</button>
                        </div>
                    )}
                </div>
            )}

            {actions.length > 0 && (
                <button className="button-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }} onClick={handleExecuteAll}>
                    <Zap size={16} /> Execute All AI Suggestions
                </button>
            )}
        </div>
    );
}

// Add CSS for hover effects if not already present in globals.css
// Usage of "interactive-card" class implies we might need to add it to globals.css

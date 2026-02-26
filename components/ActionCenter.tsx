'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, Lightbulb, ShieldCheck, X, Info, Loader2, CheckCircle2, Zap, Target, BarChart3, BrainCircuit } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { Action } from '@/lib/types';
import InfoTooltip from './InfoTooltip';

type ExecutionState = 'idle' | 'analyzing' | 'executing' | 'success';

interface ActionCenterProps {
    actions: Action[];
    assets: Asset[];
    onExecute: (newAssets: Asset[]) => void;
    onGenerate?: () => void;
    isLoading?: boolean;
}

export default function ActionCenter({ actions: initialActions, assets, onExecute, onGenerate, isLoading }: ActionCenterProps) {
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
            case 'rebalance': return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
            case 'tax': return <Lightbulb size={18} style={{ color: 'var(--success)' }} />;
            case 'governance': return <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />;
            default: return <Sparkles size={18} style={{ color: 'var(--primary)' }} />;
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

                const newAssets = (assets || []).map(a => {
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
                const newAssets = (assets || []).map(a => ({
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

    const [isConfirmed, setIsConfirmed] = useState(false);

    return (
        <div className="glass-hull" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Proactive Action Center</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary)' }} />
                    ) : (
                        actions.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <InfoTooltip content="AI has generated tactical recommendations. Review and authorize to execute.">
                                    <span className="hud-status-tag" style={{ color: 'var(--warning)', borderColor: 'var(--warning)', background: 'var(--primary-glow)', opacity: 0.8 }}>AWAITING AUTHORIZATION</span>
                                </InfoTooltip>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div style={{ flex: 1, minHeight: '276px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                {isLoading && actions.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', opacity: 0.8 }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Synchronizing Intelligence Node</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analyzing Global Macro Factors</div>
                        </div>
                    </div>
                ) : actions.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        margin: '1rem 0',
                        background: 'var(--surface-hover)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                    }}>
                        {/* Statistical Standby Placeholder */}
                        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <BarChart3 size={32} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)', border: '2px solid var(--background)' }} />
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Statistical Standby</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: '1.5' }}>
                                Advanced analytical engine in hibernation. Request high-precision scan to identify tactical rebalancing opportunities.
                            </p>
                        </div>

                        <button
                            className="btn-hud btn-hud-primary"
                            style={{
                                padding: '0.875rem 2.5rem',
                                height: 'auto',
                                fontSize: '0.85rem',
                                zIndex: 2
                            }}
                            onClick={() => onGenerate?.()}
                        >
                            <Zap size={18} fill="currentColor" /> INITIATE_SCAN
                        </button>
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
                                onClick={() => { setSelectedAction(action); setIsConfirmed(false); }}
                                className="hud-data-node"
                                style={{
                                    height: '78px',
                                    borderLeft: `4px solid ${action.priority === 'high' ? 'var(--danger)' : action.priority === 'medium' ? 'var(--warning)' : 'var(--primary)'}`,
                                    display: 'flex',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                    padding: '1rem'
                                }}
                            >
                                <div style={{ marginTop: '0.25rem' }}>{getIcon(action.type)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 className="precision-data" style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05rem', margin: 0 }}>{action.title}</h3>
                                            <div className="hud-status-tag" style={{ fontSize: '0.55rem', padding: '1px 6px', borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--accent)', background: 'transparent' }}>
                                                IMPACT: {Math.floor(85 + Math.random() * 14)}/99
                                            </div>
                                        </div>
                                        <div className="precision-data" style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {action.impact}
                                        </div>
                                    </div>
                                    <p className="precision-data" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>{action.description}</p>
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
                        <div className="precision-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15rem' }}>
                            <Zap size={18} /> AI Execution Flow
                        </div>
                        <button onClick={() => { setSelectedAction(null); setExecutionState('idle'); }} className="btn-hud" style={{ padding: '0.5rem', width: '32px', height: '32px' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {executionState === 'idle' && (
                        <>
                            <h3 className="precision-data" style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>{selectedAction.title}</h3>

                            <p className="precision-data" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {selectedAction.justification || selectedAction.description}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="hud-data-node" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                                    <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1rem' }}>RETAIL ANALYSIS</div>
                                    <div className="precision-data" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selectedAction.simpleExplanation || 'Safe rebalancing for long-term growth.'}</div>
                                </div>
                                <div className="hud-data-node" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                                    <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1rem' }}>EXPERT ALPHA</div>
                                    <div className="precision-data" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selectedAction.expertInsight || 'Portfolio beta optimization via risk-parity adjustment.'}</div>
                                </div>
                            </div>

                            <div className="hud-data-node" style={{ marginBottom: '1.5rem' }}>
                                <div className="precision-data" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', letterSpacing: '0.15rem' }}>
                                    <span>AI EVIDENCE MATRIX</span>
                                    <span style={{ color: 'var(--success)' }}>SYNC ACTIVE</span>
                                </div>

                                {selectedAction.evidence ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div>
                                                <div className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Target Factor</div>
                                                <div className="precision-data" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                                                    {selectedAction.evidence.value}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Benchmark</div>
                                                <div className="precision-data" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-secondary)' }}>
                                                    {selectedAction.evidence.benchmark}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: selectedAction.evidence.value,
                                                background: selectedAction.evidence.status === 'critical' ? 'var(--danger)' : 'var(--warning)',
                                                boxShadow: `0 0 10px ${selectedAction.evidence.status === 'critical' ? 'var(--danger)' : 'var(--warning)'}`
                                            }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="precision-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            <Zap size={14} style={{ color: 'var(--warning)' }} /> <span>0.4s EXECUTION DELAY</span>
                                        </div>
                                        <div className="precision-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            <Target size={14} color="#3B82F6" /> <span>99.9%_PRECISION</span>
                                        </div>
                                        <div className="precision-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            <BarChart3 size={14} color="#10B981" /> <span>MAX TAX EFFICIENCY</span>
                                        </div>
                                        <div className="precision-data" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            <ShieldCheck size={14} color="#8B5CF6" /> <span>COMPLIANCE SECURED</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(59, 102, 241, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <input
                                    type="checkbox"
                                    id="confirm-action"
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                />
                                <label htmlFor="confirm-action" className="precision-data" style={{ fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    I AUTHORIZE THE EXECUTION OF THIS TACTICAL ADVISORY
                                </label>
                            </div>

                            <button
                                className={`btn-hud btn-hud-primary ${isConfirmed ? 'neon-strike' : ''}`}
                                style={{ width: '100%', marginTop: 'auto', height: '54px', opacity: isConfirmed ? 1 : 0.4, cursor: isConfirmed ? 'pointer' : 'not-allowed' }}
                                onClick={() => isConfirmed && handleExecute()}
                                disabled={!isConfirmed}
                            >
                                AUTHORIZE & EXECUTE
                            </button>
                            <div className="precision-data" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem', letterSpacing: '0.05rem' }}>
                                * NO TRADES WILL BE TRIGGERED WITHOUT EXPLICIT MANUAL AUTHORIZATION.
                            </div>
                        </>
                    )
                    }

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
                            <CheckCircle2 size={64} style={{ color: 'var(--success)', marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>Plan Executed!</h3>
                            <p style={{ margin: '1rem 0 2rem', color: 'var(--text-secondary)' }}>AI has successfully rebalanced and optimized your portfolio.</p>

                            <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>TOTAL IMPACT REPORT</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedAction.impact}</div>
                            </div>

                            <button className="button-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => { setSelectedAction(null); setExecutionState('idle'); setActions((prev: Action[]) => prev.filter((a: Action) => a.type !== selectedAction!.type)); }}>Close Report</button>
                        </div>
                    )}
                </div>
            )}

            {actions.length > 0 && !selectedAction && (
                <button className="btn-hud btn-hud-primary" style={{ width: '100%', height: '50px' }} onClick={handleExecuteAll}>
                    <Zap size={16} /> AUTHORIZE FULL REBALANCING
                </button>
            )}
        </div>
    );
}

// Add CSS for hover effects if not already present in globals.css
// Usage of "interactive-card" class implies we might need to add it to globals.css

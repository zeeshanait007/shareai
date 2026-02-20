'use client';

import React from 'react';
import { X, Sparkles, Loader2, Zap, BrainCircuit, LineChart } from 'lucide-react';
import PortfolioComparison from './PortfolioComparison';
import ActionCenter from './ActionCenter';
import { Action } from '@/lib/types';
import { Asset } from '@/lib/assets';

interface AIStrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    aiAssets: Asset[];
    actions: Action[];
    insight: any;
    marketNarrative: string;
    isGeneratingAI: boolean;
    isGeneratingInsight: boolean;
    isActionsLoading: boolean;
    onExecute: (newAssets: Asset[]) => void;
    onGenerateAI: () => Promise<void>;
}

export default function AIStrategyModal({
    isOpen,
    onClose,
    assets,
    aiAssets,
    actions,
    insight,
    marketNarrative,
    isGeneratingAI,
    isGeneratingInsight,
    isActionsLoading,
    onExecute,
    onGenerateAI
}: AIStrategyModalProps) {
    if (!isOpen) return null;

    const isSyncing = isActionsLoading || isGeneratingAI || isGeneratingInsight;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div className="modal-content fade-in" style={{
                background: 'rgba(15, 17, 21, 0.98)',
                backdropFilter: 'blur(32px)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '1280px',
                maxHeight: '92vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--grad-primary)', opacity: 0.9 }}></div>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'var(--grad-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: 'var(--shadow-primary)'
                        }}>
                            <BrainCircuit size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Institutional Intelligence</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                {isSyncing ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin text-primary" />
                                        <span>Syncing market signals...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={12} className="text-yellow-500" />
                                        <span>AI Model Active & Optimized</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '2rem',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem'
                }}>
                    {/* Market Narrative Banner */}
                    {marketNarrative && (
                        <div style={{
                            padding: '1.5rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.25rem',
                            animation: 'slideDown 0.4s ease-out',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <Sparkles className="text-primary" size={28} />
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Global Market Posture</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.4' }}>{marketNarrative}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Comparison */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <LineChart size={20} className="text-primary" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Strategy Overview</h3>
                            </div>
                            <PortfolioComparison
                                userAssets={assets}
                                aiAssets={aiAssets}
                                onGenerateAI={onGenerateAI}
                                isGenerating={isGeneratingAI}
                                insight={insight}
                                isGeneratingInsight={isGeneratingInsight}
                            />
                        </div>

                        {/* Actions */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Zap size={20} className="text-yellow-500" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Execution Center</h3>
                            </div>
                            <ActionCenter
                                actions={actions}
                                assets={assets}
                                onExecute={onExecute}
                                isLoading={isActionsLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.25rem 2rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'var(--surface)',
                    gap: '1rem'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Dismiss
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onClose}
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        Apply Strategy
                    </button>
                </div>
            </div>
        </div>
    );
}

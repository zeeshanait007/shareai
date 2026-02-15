'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, Lightbulb, ShieldCheck, X, Info } from 'lucide-react';

interface Action {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
}

export default function ActionCenter({ actions }: { actions: Action[] }) {
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);

    const getIcon = (type: string) => {
        switch (type) {
            case 'rebalance': return <AlertTriangle size={18} color="#F59E0B" />;
            case 'tax': return <Lightbulb size={18} color="#10B981" />;
            case 'governance': return <ShieldCheck size={18} color="#3B82F6" />;
            default: return <Sparkles size={18} color="var(--primary)" />;
        }
    };

    const getInsightDetails = (action: Action) => {
        if (action.type === 'rebalance') {
            return "Our AI detected that this asset has outpaced other holdings, leading to a risk concentration beyond your 25% target threshold. Rebalancing will lock in gains and restore your risk-adjusted profile.";
        }
        if (action.type === 'tax') {
            return "This positioning allows for an immediate tax deduction of up to $3,000 for the current fiscal year. By harvesting this loss, you effectively reduce your taxable income while maintaining market exposure.";
        }
        return "Governance checks ensure your wealth transfer protocols remain legally valid across multiple jurisdictions. Regular review is recommended every 6 months.";
    };

    return (
        <div className="card" style={{ padding: 'var(--space-6)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Proactive Action Center</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {actions.map((action, i) => (
                    <div
                        key={i}
                        onClick={() => setSelectedAction(action)}
                        className="interactive-card"
                        style={{
                            padding: '1rem',
                            background: 'var(--surface-hover)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${action.priority === 'high' ? '#EF4444' : action.priority === 'medium' ? '#F59E0B' : '#3B82F6'}`,
                            display: 'flex',
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ marginTop: '0.25rem' }}>
                            {getIcon(action.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{action.title}</h3>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--surface)', padding: '2px 8px', borderRadius: '10px' }}>
                                    {action.impact}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                {action.description}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {selectedAction && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--background)',
                    zIndex: 10,
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                            <Info size={18} /> Imagine AI Insight
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedAction(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>{selectedAction.title}</h3>
                    <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                        {getInsightDetails(selectedAction)}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                        <button className="button-secondary" style={{ flex: 1 }} onClick={() => setSelectedAction(null)}>Dismiss</button>
                        <button className="button-primary" style={{ flex: 1 }} onClick={() => setSelectedAction(null)}>Execute Plan</button>
                    </div>
                </div>
            )}

            <button className="button-secondary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}>
                Execute All AI Suggestions
            </button>
        </div>
    );
}

// Add CSS for hover effects if not already present in globals.css
// Usage of "interactive-card" class implies we might need to add it to globals.css

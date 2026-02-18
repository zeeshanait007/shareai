'use client';

import React from 'react';
import { DeepInsight } from '@/lib/types';
import {
    FileText,
    BarChart3,
    AlertTriangle,
    Repeat,
    CheckCircle2,
    Download,
    History,
    Zap,
    TrendingDown,
    ShieldCheck,
    ArrowUpRight,
    Search,
    Dna,
    Activity,
    Scale,
    ShieldAlert
} from 'lucide-react';
import { generateAuditPDF } from '@/lib/pdf-utils';

interface InstitutionalAnalysisProps {
    symbol: string;
    insight: DeepInsight;
    isStreaming?: boolean;
}

const SectionLoader = ({ message = 'Generating analysis...' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }} className="animate-pulse">
        <div style={{ height: '0.75rem', background: 'var(--surface-hover)', borderRadius: '4px', width: '70%' }} />
        <div style={{ height: '0.75rem', background: 'var(--surface-hover)', borderRadius: '4px', width: '90%' }} />
        <div style={{ height: '0.75rem', background: 'var(--surface-hover)', borderRadius: '4px', width: '60%' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{message}</span>
    </div>
);

export default function InstitutionalAnalysis({ symbol, insight, isStreaming }: InstitutionalAnalysisProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            generateAuditPDF(symbol, insight);
        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* 1. Recommendation Summary - High Impact Glassmorphism */}
            <section className="card" style={{
                borderLeft: '4px solid var(--primary)',
                background: 'linear-gradient(135deg, var(--surface) 0%, rgba(59, 130, 246, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03 }}>
                    <Dna size={120} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    <FileText size={22} className="text-blue-500" /> 📌 RECOMMENDATION SUMMARY
                    {isStreaming && !insight.convictionExplanation && <span className="animate-ping" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />}
                </h3>

                {insight.convictionExplanation ? (
                    <div className="fade-in">
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: '1.7', fontWeight: 500, maxWidth: '900px' }}>
                            {insight.convictionExplanation}
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--primary)',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                                <Zap size={14} /> ALPHA TARGET: {insight.alphaScore}%
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--success)',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                <ArrowUpRight size={14} /> SHARPE RATIO: {insight.riskRewardRatio}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                color: '#8b5cf6',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                                <Activity size={14} /> REGIME: {insight.volatilityRegime}
                            </div>
                        </div>
                    </div>
                ) : (
                    <SectionLoader message="Synthesizing institutional recommendation..." />
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. Evidence Breakdown - Visual Factor exposure */}
                <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <BarChart3 size={20} className="text-indigo-500" /> EVIDENCE BREAKDOWN
                    </h3>
                    {insight.evidence?.quantitativeDrivers ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">QUANTITATIVE DRIVERS</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {insight.evidence.quantitativeDrivers.map((d: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{d}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(insight.evidence.factorExposure || {}).map(([key, val]: [string, string]) => (
                                    <div key={key} style={{
                                        padding: '0.75rem',
                                        background: 'var(--surface-hover)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.4rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{key}</span>
                                            <span style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 800 }}>{val}</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: val === 'High' ? '90%' : val === 'Medium' ? '50%' : '20%',
                                                height: '100%',
                                                background: 'var(--primary)',
                                                borderRadius: '2px'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: 'rgba(59, 130, 246, 0.03)',
                                borderRadius: '12px',
                                border: '1px dashed rgba(59, 130, 246, 0.2)'
                            }}>
                                <Search size={18} className="text-blue-400" />
                                <div style={{ fontSize: '0.85rem' }}>
                                    <span className="text-muted-foreground">Historical Reliability:</span>
                                    <span className="font-black ml-2" style={{ color: 'var(--primary)' }}>{insight.evidence.historicalProbability}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Running quantitative simulations..." />
                    )}
                </section>

                {/* 3. Risk Sensitivity - Visual Heatmap/Gauge Look */}
                <section className="card" style={{ border: '1px solid var(--error-border)', background: 'rgba(239, 68, 68, 0.02)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <AlertTriangle size={20} className="text-red-500" /> RISK SENSITIVITY
                    </h3>
                    {insight.riskSensitivity?.rateHikeImpact ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                                        <Zap size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Rate Exposure</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>{insight.riskSensitivity.rateHikeImpact}</span>
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>
                                        <TrendingDown size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Macro Shock</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>{insight.riskSensitivity.recessionImpact}</span>
                                </div>
                            </div>

                            <div style={{
                                padding: '1.25rem',
                                background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DR_MAX_DRAWDOWN_ESTIMATE</span>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>{insight.riskSensitivity.worstCaseBand}</div>
                                </div>
                                <ShieldAlert size={40} color="white" style={{ opacity: 0.3 }} />
                            </div>

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                Stress test simulated across 10,000 Monte Carlo paths.
                            </p>
                        </div>
                    ) : (
                        <SectionLoader message="Performing stress-test scenarios..." />
                    )}
                </section>

                {/* 4. Counter-Case - Thesis vs Invalidation focus */}
                <section className="card" style={{ background: 'var(--surface)', border: '2px dashed var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Repeat size={20} className="text-orange-500" /> COUNTER-CASE THESIS
                    </h3>
                    {insight.counterCase?.thesisInvalidation ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border)' }}>
                                <div style={{ position: 'absolute', left: '-6px', top: '0', padding: '2px', background: 'var(--background)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }} />
                                </div>
                                <span className="text-[10px] font-black text-orange-600 uppercase mb-1 block">Thesis Invalidation Vectors</span>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                    {insight.counterCase.thesisInvalidation}
                                </p>
                            </div>

                            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border)' }}>
                                <div style={{ position: 'absolute', left: '-6px', top: '0', padding: '2px', background: 'var(--background)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">Structural Market Shift Risks</span>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                    {insight.counterCase.marketShiftRisks}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Challenging current investment thesis..." />
                    )}
                </section>

                {/* 5. Compliance Snapshot - Precise Status Board */}
                <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--success-border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <ShieldCheck size={20} className="text-emerald-500" /> COMPLIANCE SNAPSHOT
                    </h3>
                    {insight.compliance?.riskMatch ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: 'var(--success)' }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Match</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{insight.compliance.riskMatch}</div>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border)', height: '100%' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: '#6366f1' }}>
                                        <Scale size={24} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suitability</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{insight.compliance.suitabilityStatus}</div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">REGULATORY STANDING & FLAGS</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {insight.compliance.regulatoryFlags.map((flag: string, i: number) => (
                                        <div key={i} style={{
                                            padding: '0.4rem 0.75rem',
                                            background: 'var(--surface-hover)',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            border: '1px solid var(--border)',
                                            color: 'var(--success)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }} />
                                            {flag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Verifying regulatory alignment..." />
                    )}
                </section>
            </div>

            {/* Audit Log / Actions - Deep Institutional Styling */}
            <div className="card" style={{
                background: 'var(--surface-hover)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border)',
                padding: '1.25rem 2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'var(--background)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)'
                    }}>
                        <History size={28} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '-0.01em', marginBottom: '0.2rem' }}>AUDIT LOG & FINAL PDF REPORT</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.4' }}>
                            Full institutional rationale, probability matrices, and time-stamped market state for compliance purposes.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || isStreaming}
                    className="btn btn-primary"
                    style={{
                        gap: '0.75rem',
                        padding: '1rem 2rem',
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        minWidth: '220px',
                        borderRadius: '14px',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                        opacity: isStreaming ? 0.5 : 1
                    }}
                >
                    {isGeneratingPDF ? (
                        <>
                            <Loader2 className="animate-spin" size={18} /> ASSEMBLING REPORT...
                        </>
                    ) : isStreaming ? (
                        <>AWAITING FINAL DATA...</>
                    ) : (
                        <>
                            <Download size={20} /> DOWNLOAD AUDIT
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

import { Loader2 } from 'lucide-react';

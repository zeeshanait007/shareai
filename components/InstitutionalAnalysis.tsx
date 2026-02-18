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
    ShieldCheck
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
            <section className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <FileText size={20} className="text-blue-500" /> 📌 Recommendation Summary
                    {isStreaming && !insight.convictionExplanation && <span className="animate-pulse" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />}
                </h3>
                {insight.convictionExplanation ? (
                    <>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                            {insight.convictionExplanation}
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <div className="badge badge-primary">ROI Target: {insight.alphaScore}%</div>
                            <div className="badge badge-secondary">Risk/Reward: {insight.riskRewardRatio}</div>
                        </div>
                    </>
                ) : (
                    <SectionLoader message="Synthesizing recommendation..." />
                )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BarChart3 size={18} className="text-indigo-500" /> 📊 Evidence Breakdown
                    </h3>
                    {insight.evidence?.quantitativeDrivers ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase">Quantitative Drivers</span>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.25rem' }}>
                                    {insight.evidence.quantitativeDrivers.map((d: string, i: number) => (
                                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {d}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(insight.evidence.factorExposure || {}).map(([key, val]: [string, string]) => (
                                    <div key={key} style={{ padding: '0.5rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                                        <span className="text-[10px] text-muted-foreground block">{key}</span>
                                        <span className="text-sm font-medium">{val}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                <span className="font-medium">Historical Probability:</span> {insight.evidence.historicalProbability}
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Uncovering market evidence..." />
                    )}
                </section>

                <section className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <AlertTriangle size={18} className="text-red-500" /> ⚠ Risk Sensitivity
                    </h3>
                    {insight.riskSensitivity?.rateHikeImpact ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                <Zap size={16} className="text-yellow-500 mt-1" />
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase block">Rate Hike Impact</span>
                                    <span style={{ fontSize: '0.875rem' }}>{insight.riskSensitivity.rateHikeImpact}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                <TrendingDown size={16} className="text-red-500 mt-1" />
                                <div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase block">Recession Impact</span>
                                    <span style={{ fontSize: '0.875rem' }}>{insight.riskSensitivity.recessionImpact}</span>
                                </div>
                            </div>
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--error-border)' }}>
                                <span className="text-xs font-bold text-red-600 uppercase block">Worst-Case Scenario Band</span>
                                <span className="text-lg font-bold text-red-700">{insight.riskSensitivity.worstCaseBand}</span>
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Simulating risk scenarios..." />
                    )}
                </section>

                <section className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Repeat size={18} className="text-orange-500" /> 🔁 Counter-Case
                    </h3>
                    {insight.counterCase?.thesisInvalidation ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span className="font-bold text-orange-600">Thesis Invalidation:</span> {insight.counterCase.thesisInvalidation}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span className="font-bold text-orange-600">Market Shift:</span> {insight.counterCase.marketShiftRisks}
                            </p>
                        </div>
                    ) : (
                        <SectionLoader message="Analyzing invalidation vectors..." />
                    )}
                </section>

                <section className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={18} className="text-emerald-500" /> 🧾 Compliance Snapshot
                    </h3>
                    {insight.compliance?.riskMatch ? (
                        <div className="space-y-3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span className="text-muted-foreground">Risk Match:</span>
                                <span className="font-bold text-emerald-600">{insight.compliance.riskMatch}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span className="text-muted-foreground">Suitability:</span>
                                <span className="font-bold text-emerald-600">{insight.compliance.suitabilityStatus}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span className="text-xs font-bold text-muted-foreground uppercase block">Regulatory Flags</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    {insight.compliance.regulatoryFlags.map((flag: string, i: number) => (
                                        <span key={i} className="badge badge-success" style={{ fontSize: '10px' }}>{flag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <SectionLoader message="Reviewing regulatory alignment..." />
                    )}
                </section>
            </div>

            {/* Audit Log / Actions */}
            <div className="card" style={{ background: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <History size={24} className="text-muted-foreground" />
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '0.925rem' }}>Audit Log & PDF Export</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Institutional report contains full rationale and time-stamped market state.</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || isStreaming}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem', minWidth: '180px', opacity: isStreaming ? 0.5 : 1 }}
                >
                    {isGeneratingPDF ? (
                        <>In Progress...</>
                    ) : isStreaming ? (
                        <>Awaiting Analysis...</>
                    ) : (
                        <>
                            <Download size={16} /> Download PDF Audit
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { Landmark, Users, Key, FileText, ChevronRight, ShieldCheck, X, Eye } from 'lucide-react';

export default function EstateVault() {
    const [activeDetail, setActiveDetail] = useState<string | null>(null);

    const categories = [
        { id: 'gov', icon: <Users size={18} />, title: 'Family Governance', status: 'Active (3 Members)', detail: ' Sarah Ali (Full Access) and Trustees are verified. Digital access tokens are rotated every 90 days for security.' },
        { id: 'will', icon: <FileText size={18} />, title: 'Digital Will & Assets', status: 'Verified Oct 2025', detail: 'Contains instructions for 12 crypto wallets, 4 private equity holdings, and primary real estate titles.' },
        { id: 'succ', icon: <Key size={18} />, title: 'Succession Planning', status: 'Pending Review', detail: 'Update required for the 180-day inactivity trigger. Current heirs: Sarah, Yousuf, Sofia.' },
        { id: 'docs', icon: <Landmark size={18} />, title: 'Trust & Estate Docs', status: 'Securely Stored', detail: 'All legal documents are encrypted with AES-256 and stored across decentralized nodes for redundancy.' }
    ];

    return (
        <div className="card" style={{ padding: 'var(--space-6)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Landmark size={24} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Imagine Estate Vault</h2>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Securely manage cross-generational wealth transfer and family access controls.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map((cat, i) => (
                    <div
                        key={i}
                        onClick={() => setActiveDetail(cat.id)}
                        className="interactive-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'var(--surface)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--surface-hover)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ color: 'var(--primary)' }}>{cat.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{cat.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.status}</div>
                            </div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                ))}
            </div>

            {activeDetail && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--surface)',
                    zIndex: 20,
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700 }}>
                            <Eye size={16} /> Vault Detail
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveDetail(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                        {categories.find(c => c.id === activeDetail)?.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        {categories.find(c => c.id === activeDetail)?.detail}
                    </p>
                    <button className="button-secondary" style={{ marginTop: 'auto' }} onClick={() => setActiveDetail(null)}>Close</button>
                </div>
            )}

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <ShieldCheck size={14} /> Inheritance Protection Active
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Your "Dead Man's Switch" is configured to release credentials to 3 primary heirs after 180 days of inactivity.
                </p>
            </div>
        </div>
    );
}

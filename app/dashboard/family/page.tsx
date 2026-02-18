import React from 'react';

import { ShieldCheck, Users, Landmark, FileText } from 'lucide-react';

export default function FamilyGovernancePage() {
    return (
        <div className="fade-in">
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: 'var(--space-6)' }}>Family Governance & Estate</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={24} color="var(--primary)" /> Managed Beneficiaries
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'Sarah Ali', relation: 'Spouse', access: 'Full Access', lastActive: '2 days ago' },
                            { name: 'Yousuf Ali', relation: 'Son (Minor)', access: 'View Only (Trustee: Sarah)', lastActive: 'Never' },
                            { name: 'Sofia Ali', relation: 'Daughter (Minor)', access: 'View Only (Trustee: Sarah)', lastActive: 'Never' }
                        ].map((member, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{member.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.relation} • {member.access}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Active</div>
                                    <div style={{ fontSize: '0.8125rem' }}>{member.lastActive}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="button-secondary" style={{ marginTop: '2rem', width: '100%' }}>
                        Add Family Member / Entity
                    </button>

                    <hr style={{ margin: '2rem 0', opacity: 0.1 }} />

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Succession Instructions</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        In the event of an "Inactivity Trigger" (180 days), the system will automatically initiate the following protocol:
                        1. <strong>Verification:</strong> Send proof-of-life requests to 3 alternate contacts.
                        2. <strong>Decryption:</strong> Release the primary vault key to Sarah Ali.
                        3. <strong>Execution:</strong> Transfer custody of ESOPs and Crypto keys as per the Digital Will.
                    </p>
                </div>
            </div>
        </div>
    );
}

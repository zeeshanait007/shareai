'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SaveDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

export default function SaveDashboardModal({ isOpen, onClose, onSave }: SaveDashboardModalProps) {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            setName('');
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="card fade-in" style={{
                width: '100%',
                maxWidth: '420px',
                margin: '1rem',
                background: 'rgba(15, 17, 21, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative',
                overflow: 'hidden',
                padding: 'var(--space-8)'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--grad-primary)', opacity: 0.8 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Save Dashboard</h2>
                    <button onClick={onClose} style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                            Dashboard Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Retirement Fund, Crypto High Risk"
                            autoFocus
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!name.trim()}
                        >
                            <Check size={18} style={{ marginRight: '0.5rem' }} /> Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

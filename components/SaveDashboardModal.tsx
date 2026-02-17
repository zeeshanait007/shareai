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
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Save Dashboard</h2>
                    <button onClick={onClose} style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--surface)' }}>
                        <X size={20} />
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
                            className="input"
                            autoFocus
                            required
                            style={{ width: '100%' }}
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

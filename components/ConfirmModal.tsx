'use client';

import React from 'react';
import { X, AlertTriangle, Info, Check } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={24} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={24} className="text-yellow-500" />;
            default: return <Info size={24} className="text-blue-500" />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            default: return 'bg-blue-600 hover:bg-blue-700 text-white';
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
                maxWidth: '400px',
                margin: '1rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {getIcon()}
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            onClick={onClose}
                            className="btn"
                            style={{
                                background: 'var(--surface-hover)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="btn"
                            style={{
                                background: type === 'danger' ? 'var(--danger)' : type === 'warning' ? '#F59E0B' : 'var(--primary)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

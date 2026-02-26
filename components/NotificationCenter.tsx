'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Calendar, AlertTriangle, TrendingUp, Sparkles, MessageSquare, Info, CheckCircle2 } from 'lucide-react';

export interface Notification {
    id: string;
    type: 'market' | 'portfolio' | 'ai' | 'system';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    urgency: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onClearAll: () => void;
}

export default function NotificationCenter({ notifications, onMarkRead, onClearAll }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string, urgency: string) => {
        const color = urgency === 'high' ? 'var(--danger)' : (urgency === 'medium' ? 'var(--warning)' : 'var(--primary)');
        switch (type) {
            case 'market': return <TrendingUp size={16} color={color} />;
            case 'portfolio': return <AlertTriangle size={16} color={color} />;
            case 'ai': return <Sparkles size={16} color={color} />;
            default: return <Info size={16} color={color} />;
        }
    };

    const formatTime = (ts: number) => {
        if (!mounted) return '--';
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(ts).toLocaleDateString('en-US');
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                className="interactive-card"
            >
                <Bell size={18} style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        minWidth: '14px',
                        height: '14px',
                        padding: '0 4px',
                        borderRadius: '10px',
                        background: 'var(--danger)',
                        border: '2px solid var(--background)',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="glass-hull fade-in" style={{
                    position: 'absolute',
                    top: 'calc(100% + 1rem)',
                    right: '-0.5rem',
                    width: '360px',
                    maxHeight: '500px',
                    background: 'rgba(13, 16, 23, 0.98)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--glass-border)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={16} color="var(--primary)" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>AI Notification Center</h3>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <CheckCircle2 size={32} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>All catch up!</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>No new market alerts or insights.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => onMarkRead(n.id)}
                                        style={{
                                            padding: '1rem 1.25rem',
                                            borderBottom: '1px solid var(--border)',
                                            background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            gap: '1rem'
                                        }}
                                        className="sidebar-item"
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            border: n.read ? '1px solid var(--border)' : '1px solid var(--primary-low)'
                                        }}>
                                            {getIcon(n.type, n.urgency)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.15rem' }}>
                                                <h4 style={{ fontSize: '0.8125rem', fontWeight: n.read ? 600 : 800, color: 'var(--text-primary)', margin: 0 }}>{n.title}</h4>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{formatTime(n.timestamp)}</span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>{n.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid var(--border)',
                        textAlign: 'center'
                    }}>
                        <button style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>
                            VIEW SYSTEM LOGS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

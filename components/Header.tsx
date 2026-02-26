'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User, TrendingUp, TrendingDown, Coins, RefreshCw, Sun, Moon } from 'lucide-react';
import Search from './Search';
import NotificationCenter from './NotificationCenter';
import { useDashboard } from '@/providers/DashboardProvider';

export default function Header() {
    const { notifications, markNotificationRead, clearNotifications, theme, toggleTheme } = useDashboard();
    const [tickerData, setTickerData] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    const fetchTicker = async () => {
        try {
            const response = await fetch('/api/ai/market-context');
            if (response.ok) {
                const data = await response.json();
                setTickerData(data.indicators);
            }
        } catch (err) {
            console.error('Ticker fetch error:', err);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const vix = tickerData.find(t => t.name.includes('VIX'));
    const spy = tickerData.find(t => t.name.includes('SPY'));
    const btc = tickerData.find(t => t.name.includes('BTC'));

    return (
        <header className="glass-hull" style={{
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-8)',
            position: 'sticky',
            top: 0,
            background: 'var(--glass-bg)',
            zIndex: 40,
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Search />

                {/* Live Macro Ticker - Elite Alpha Feature */}
                {mounted && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '0.4rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '2rem',
                        border: '1px solid var(--border)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>VIX</span>
                            <span style={{ color: vix?.change.startsWith('+') ? 'var(--danger)' : 'var(--success)' }}>
                                {vix?.value || '---'}
                            </span>
                            {vix?.change.startsWith('+') ? <TrendingUp size={10} color="var(--danger)" /> : <TrendingDown size={10} color="var(--success)" />}
                        </div>
                        <div style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>SPY</span>
                            <span style={{ color: 'var(--text-primary)' }}>{spy?.value || '---'}</span>
                            <span style={{ color: spy?.change.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontSize: '0.6rem' }}>
                                {spy?.change || '0.00%'}
                            </span>
                        </div>
                        <div style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>BTC</span>
                            <span style={{ color: 'var(--accent)' }}>
                                {btc ? (parseFloat(btc.value) / 1000).toFixed(1) + 'K' : '---'}
                            </span>
                        </div>
                        <div style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                        <button
                            onClick={fetchTicker}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.2rem', display: 'flex', alignItems: 'center', opacity: 0.8 }}
                            className="stagger-entry"
                            title="Refresh Ticker"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={toggleTheme}
                    className="btn-hud"
                    style={{ padding: '0.6rem', width: '40px', height: '40px', justifyContent: 'center' }}
                    title={theme === 'dark' ? "SWITCH TO LIGHT MODE" : "SWITCH TO DARK MODE"}
                >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                {/* Node Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1.25rem', borderRight: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>AI Connection</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>NEURAL STANDBY</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', opacity: 0.6 }} />
                </div>

                <NotificationCenter
                    notifications={notifications}
                    onMarkRead={markNotificationRead}
                    onClearAll={clearNotifications}
                />

                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }} className="interactive-card">
                    <User size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
            </div>
        </header>
    );
}

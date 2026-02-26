'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import Search from './Search';
import NotificationCenter from './NotificationCenter';
import { useDashboard } from '@/providers/DashboardProvider';

export default function Header() {
    const { notifications, markNotificationRead, clearNotifications } = useDashboard();
    const [tickerData, setTickerData] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

        fetchTicker();
        const interval = setInterval(fetchTicker, 60000); // Live sync every minute
        return () => clearInterval(interval);
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
            background: 'rgba(9, 11, 16, 0.8)',
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
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-muted)'
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
                            <div className="live-pulse" style={{ width: 4, height: 4, background: 'var(--accent)' }} />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Node Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Connection</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SYNCING LIVE</div>
                    </div>
                    <div className="neon-strike" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
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

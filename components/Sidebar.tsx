'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LineChart, PieChart, Settings, Search, Sparkles, TrendingUp, Users, Trash2, Save } from 'lucide-react';
import { useDashboard } from '@/providers/DashboardProvider';
import ConfirmModal from '@/components/ConfirmModal';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Picks', href: '/dashboard/discovery', icon: Sparkles },
    { name: 'Watchlist', href: '/dashboard/watchlist', icon: TrendingUp },
    { name: 'Analysis', href: '/dashboard/analysis', icon: LineChart },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { dashboards, currentDashboardId, loadDashboard, deleteDashboard, updateDashboard } = useDashboard();
    const [mounted, setMounted] = React.useState(false);
    const [healthData, setHealthData] = React.useState<{
        status: string;
        report: string;
        healthScore: number;
        bars: number[];
        latency: number;
        uptime: string;
    }>({
        status: 'Optimizing...',
        report: '',
        healthScore: 100,
        bars: [1, 1, 1, 1, 1, 1, 1, 1],
        latency: 0,
        uptime: '0h 0m'
    });

    const fetchHealth = async () => {
        try {
            const response = await fetch('/api/ai/system-health');
            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
            }
        } catch (error) {
            console.error('Health check failed:', error);
        }
    };

    React.useEffect(() => {
        setMounted(true);
        fetchHealth();
        const interval = setInterval(fetchHealth, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const handleDashboardClick = (id: string | null) => {
        loadDashboard(id);
        if (pathname !== '/dashboard') {
            router.push('/dashboard');
        }
    };

    const [confirmModal, setConfirmModal] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    return (
        <>
            <aside className="glass-hull" style={{
                width: '280px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 30,
                background: 'rgba(9, 11, 16, 0.85)'
            }}>
                <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className="neon-strike" style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--grad-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <div>
                        <span style={{ fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>ShareAI</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <div className="live-pulse" style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Node</span>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', paddingLeft: '1rem', opacity: 0.6 }}>Navigation Matrix</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href && currentDashboardId === null;

                            if (item.name === 'Dashboard') {
                                return (
                                    <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                                        <div
                                            onClick={() => handleDashboardClick(null)}
                                            className={isActive ? 'glass-hull neon-strike' : ''}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0.85rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                                fontWeight: isActive ? 800 : 500,
                                                transition: 'all var(--transition-normal)',
                                                cursor: 'pointer',
                                                fontSize: '0.9375rem'
                                            }}
                                        >
                                            <item.icon size={18} style={{ marginRight: '0.875rem', color: isActive ? 'var(--primary)' : 'inherit' }} />
                                            {item.name}
                                            {isActive && (
                                                <div style={{
                                                    marginLeft: 'auto',
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: 'var(--primary)',
                                                    boxShadow: '0 0 8px var(--primary)'
                                                }} />
                                            )}
                                        </div>

                                        {/* Saved Dashboards Sub-list */}
                                        {mounted && dashboards.length > 0 && (
                                            <ul style={{ listStyle: 'none', marginLeft: '2.25rem', marginTop: '0.75rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem', paddingRight: 0 }}>
                                                {dashboards.map(dash => (
                                                    <li key={dash.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '0.15rem' }}>
                                                        <div
                                                            onClick={() => handleDashboardClick(dash.id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem 0.75rem',
                                                                fontSize: '0.8125rem',
                                                                color: currentDashboardId === dash.id ? 'var(--primary)' : 'var(--text-muted)',
                                                                cursor: 'pointer',
                                                                fontWeight: currentDashboardId === dash.id ? 800 : 500,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                borderRadius: '4px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            className="sidebar-item"
                                                        >
                                                            {dash.name}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.15rem', opacity: 0.4 }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (currentDashboardId === dash.id) {
                                                                        updateDashboard(dash.id);
                                                                    } else {
                                                                        setConfirmModal({
                                                                            isOpen: true,
                                                                            title: 'Overwrite Dataset?',
                                                                            message: `Sync current live state to "${dash.name}" baseline?`,
                                                                            type: 'warning',
                                                                            confirmText: 'Sync',
                                                                            onConfirm: () => updateDashboard(dash.id)
                                                                        });
                                                                    }
                                                                }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.35rem' }}
                                                                title="Sync State"
                                                            >
                                                                <Save size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmModal({
                                                                        isOpen: true,
                                                                        title: 'Purge Dataset?',
                                                                        message: `Decommission current data cluster "${dash.name}"?`,
                                                                        type: 'danger',
                                                                        confirmText: 'Purge',
                                                                        onConfirm: () => deleteDashboard(dash.id)
                                                                    });
                                                                }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0.35rem' }}
                                                                title="Delete Cluster"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            }

                            return (
                                <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                                    <Link
                                        href={item.href}
                                        className={pathname === item.href ? 'glass-hull neon-strike' : ''}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.85rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            color: pathname === item.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            background: pathname === item.href ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                            fontWeight: pathname === item.href ? 800 : 500,
                                            transition: 'all var(--transition-normal)',
                                            fontSize: '0.9375rem'
                                        }}
                                    >
                                        <item.icon size={18} style={{ marginRight: '0.875rem', color: pathname === item.href ? 'var(--primary)' : 'inherit' }} />
                                        {item.name}
                                        {pathname === item.href && (
                                            <div style={{
                                                marginLeft: 'auto',
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: 'var(--primary)',
                                                boxShadow: '0 0 8px var(--primary)'
                                            }} />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer HUD info */}
                {mounted && (
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Health</span>
                                <span style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 900,
                                    color: healthData.status === 'Nominal' || healthData.status === 'Optimized' ? 'var(--success)' : (healthData.status === 'Degraded' ? 'var(--warning)' : 'var(--danger)'),
                                    textTransform: 'uppercase'
                                }}>{healthData.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {healthData.bars.map((val, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        height: '3px',
                                        background: val === 1 ? 'var(--success)' : 'var(--surface-hover)',
                                        borderRadius: '1px',
                                        opacity: 0.8,
                                        animation: val === 1 ? 'dataPulse 2s infinite' : 'none',
                                        animationDelay: `${i * 0.1}s`
                                    }} />
                                ))}
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                                <span>LAT: {healthData.latency}ms</span>
                                <span>UP: {healthData.uptime}</span>
                            </div>
                            {healthData.report && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '4px',
                                    fontSize: '0.55rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.4',
                                    borderLeft: '2px solid var(--primary)'
                                }}>
                                    {healthData.report}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </aside>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </>
    );
}

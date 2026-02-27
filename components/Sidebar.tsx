'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LineChart, PieChart, Settings, Search, Sparkles, TrendingUp, Users, Trash2, Save, RefreshCw, Shield, Info } from 'lucide-react';
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
    const [showHealthReport, setShowHealthReport] = React.useState(false);
    const [isRefreshingHealth, setIsRefreshingHealth] = React.useState(false);

    const [healthData, setHealthData] = React.useState<{
        status: string;
        report: string;
        healthScore: number;
        bars: number[];
        latency: number;
        uptime: string;
    }>({
        status: 'NEURAL STANDBY',
        report: 'Awaiting manual intelligence synchronization.',
        healthScore: 100,
        bars: [0, 0, 0, 0, 0, 0, 0, 0],
        latency: 0,
        uptime: '0h 0m'
    });

    const fetchHealth = async () => {
        setIsRefreshingHealth(true);
        try {
            const response = await fetch('/api/ai/system-health');
            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
            }
        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setIsRefreshingHealth(false);
        }
    };

    React.useEffect(() => {
        setMounted(true);
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

    const handleDeleteDashboard = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Delete Dashboard',
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'DELETE',
            onConfirm: () => {
                deleteDashboard(id);
                closeConfirm();
            }
        });
    };

    return (
        <>
            <aside className="glass-hull" style={{
                width: '280px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                padding: 'var(--space-8) var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--border)',
                zIndex: 30
            }}>
                <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--grad-primary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-primary)'
                    }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <div>
                        <span style={{ fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>ShareAI</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <div className="status-indicator" />
                            <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>QUANTUM NODE</span>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', paddingLeft: '1rem', opacity: 0.6 }}>Navigation Matrix</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href && currentDashboardId === null;

                            return (
                                <li key={item.href} style={{ marginBottom: 'var(--space-2)' }}>
                                    <div
                                        onClick={() => handleDashboardClick(item.href === '/dashboard' ? null : null)} /* Simplified for layout fix */
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            background: isActive ? 'var(--surface-hover)' : 'transparent',
                                            border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                            fontWeight: isActive ? 700 : 500,
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                        className={!isActive ? "interactive-card" : ""}
                                    >
                                        {item.name === 'Dashboard' ? (
                                            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none', width: '100%' }}>
                                                <item.icon size={18} style={{ marginRight: '0.875rem', color: isActive ? 'var(--primary)' : 'inherit' }} />
                                                {item.name}
                                            </Link>
                                        ) : (
                                            <Link href={item.href} style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none', width: '100%' }}>
                                                <item.icon size={18} style={{ marginRight: '0.875rem', color: isActive ? 'var(--primary)' : 'inherit' }} />
                                                {item.name}
                                            </Link>
                                        )}
                                        {isActive && (
                                            <div style={{
                                                marginLeft: 'auto',
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: 'var(--primary)',
                                                boxShadow: '0 0 4px var(--primary)'
                                            }} />
                                        )}
                                    </div>

                                    {/* Saved Dashboards Sub-list */}
                                    {item.name === 'Dashboard' && mounted && dashboards.length > 0 && (
                                        <ul style={{ listStyle: 'none', marginLeft: '2.25rem', marginTop: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem' }}>
                                            {dashboards.map(dash => (
                                                <li key={dash.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                                    <div
                                                        onClick={() => handleDashboardClick(dash.id)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.35rem 0.75rem',
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
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dash.name}</span>
                                                            <button
                                                                onClick={(e) => handleDeleteDashboard(e, dash.id, dash.name)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    padding: '4px',
                                                                    cursor: 'pointer',
                                                                    opacity: 0.4,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'all 0.2s',
                                                                    color: 'var(--text-muted)'
                                                                }}
                                                                className="hover-danger"
                                                                title="Delete Dashboard"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* System Health Monitor */}
                <div style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    background: 'var(--grad-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden'
                }} className="data-glimmer">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={12} className="text-secondary" />
                            <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health</span>
                        </div>
                        <button
                            onClick={fetchHealth}
                            disabled={isRefreshingHealth}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Refresh Health Status"
                        >
                            <RefreshCw size={10} className={isRefreshingHealth ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {healthData.status === 'nominal' ? 'NOMINAL' : healthData.status.toUpperCase()}
                        </span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${healthData.latency}%`, height: '100%', background: 'var(--grad-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }}>{healthData.latency}ms</span>
                    </div>

                    <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                        <button
                            onMouseEnter={() => setShowHealthReport(true)}
                            onMouseLeave={() => setShowHealthReport(false)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                cursor: 'help',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <Info size={12} /> STATUS REPORT
                        </button>

                        {showHealthReport && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                width: '220px',
                                marginBottom: '0.75rem',
                                padding: '1rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-lg)',
                                zIndex: 100,
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.4',
                                borderLeft: '2px solid var(--primary)'
                            }}>
                                {healthData.report}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type as any}
                confirmText={confirmModal.confirmText}
            />
        </>
    );
}

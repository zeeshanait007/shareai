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

    return (
        <>
            <aside style={{
                width: '280px',
                borderRight: '1px solid var(--border)',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                background: 'var(--background)',
                padding: 'var(--space-8) var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
            }}>
                <div style={{ marginBottom: 'var(--space-12)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'var(--grad-primary)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-primary)'
                    }}>
                        <Sparkles size={20} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ShareAI</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none' }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href && currentDashboardId === null;

                            if (item.name === 'Dashboard') {
                                return (
                                    <li key={item.href} style={{ marginBottom: 'var(--space-2)' }}>
                                        <div
                                            onClick={() => handleDashboardClick(null)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: 'var(--space-3) var(--space-4)',
                                                borderRadius: 'var(--radius-md)',
                                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                                fontWeight: isActive ? 600 : 500,
                                                transition: 'all var(--transition-fast)',
                                                cursor: 'pointer',
                                                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                                            }}
                                        >
                                            <item.icon size={20} style={{ marginRight: 'var(--space-3)' }} />
                                            {item.name}
                                        </div>

                                        {/* Saved Dashboards Sub-list */}
                                        {mounted && dashboards.length > 0 && (
                                            <ul style={{ listStyle: 'none', marginLeft: '2.5rem', marginTop: '0.5rem', borderLeft: '1px solid var(--border)' }}>
                                                {dashboards.map(dash => (
                                                    <li key={dash.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        <div
                                                            onClick={() => handleDashboardClick(dash.id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem 1rem',
                                                                fontSize: '0.875rem',
                                                                color: currentDashboardId === dash.id ? 'var(--primary)' : 'var(--text-secondary)',
                                                                cursor: 'pointer',
                                                                fontWeight: currentDashboardId === dash.id ? 500 : 400,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}
                                                            className="sidebar-item"
                                                        >
                                                            {dash.name}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (currentDashboardId === dash.id) {
                                                                        updateDashboard(dash.id);
                                                                        // Optional: Show success toast instead of alert
                                                                        // For now, removing the alert for cleaner UX or using a temporary "Saved" indicator
                                                                    } else {
                                                                        setConfirmModal({
                                                                            isOpen: true,
                                                                            title: 'Overwrite Dashboard?',
                                                                            message: `Are you sure you want to overwrite "${dash.name}" with your current view?`,
                                                                            type: 'warning',
                                                                            confirmText: 'Overwrite',
                                                                            onConfirm: () => updateDashboard(dash.id)
                                                                        });
                                                                    }
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: 'var(--text-muted)',
                                                                    cursor: 'pointer',
                                                                    padding: '0 0.5rem',
                                                                    opacity: 0.6,
                                                                    transition: 'opacity 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                                                title="Save Current State to Dashboard"
                                                            >
                                                                <Save size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmModal({
                                                                        isOpen: true,
                                                                        title: 'Delete Dashboard?',
                                                                        message: `Are you sure you want to delete "${dash.name}"? This action cannot be undone.`,
                                                                        type: 'danger',
                                                                        confirmText: 'Delete',
                                                                        onConfirm: () => deleteDashboard(dash.id)
                                                                    });
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: 'var(--text-muted)',
                                                                    cursor: 'pointer',
                                                                    padding: '0 0.5rem',
                                                                    opacity: 0.6,
                                                                    transition: 'opacity 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                                                title="Delete Dashboard"
                                                            >
                                                                <Trash2 size={14} />
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
                                <li key={item.href} style={{ marginBottom: 'var(--space-2)' }}>
                                    <Link
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 'var(--space-3) var(--space-4)',
                                            borderRadius: 'var(--radius-md)',
                                            color: pathname === item.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            background: pathname === item.href ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            border: pathname === item.href ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                            fontWeight: pathname === item.href ? 600 : 500,
                                            transition: 'all var(--transition-fast)',
                                            boxShadow: pathname === item.href ? 'var(--shadow-sm)' : 'none'
                                        }}
                                    >
                                        <item.icon size={20} style={{ marginRight: 'var(--space-3)' }} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
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

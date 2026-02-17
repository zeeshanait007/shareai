'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, PieChart, Settings, Search, Sparkles, TrendingUp, Users } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Picks', href: '/dashboard/discovery', icon: Sparkles },
    { name: 'Watchlist', href: '/dashboard/watchlist', icon: TrendingUp },
    { name: 'Analysis', href: '/dashboard/analysis', icon: LineChart },
    { name: 'Family', href: '/dashboard/family', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: '250px',
            borderRight: '1px solid var(--border)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'var(--background)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ShareAI</span>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href} style={{ marginBottom: 'var(--space-2)' }}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 'var(--space-2) var(--space-4)',
                                        borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: isActive ? 'var(--surface-hover)' : 'transparent',
                                        fontWeight: isActive ? 500 : 400,
                                        transition: 'all var(--transition-fast)'
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
    );
}

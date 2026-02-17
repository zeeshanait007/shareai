'use client';

import { Bell, User } from 'lucide-react';
import Search from './Search';

export default function Header() {
    return (
        <header style={{
            height: '64px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            position: 'sticky',
            top: 0,
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 10
        }}>
            <Search />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} />
                </div>
            </div>
        </header>
    );
}

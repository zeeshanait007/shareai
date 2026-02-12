import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{ flex: 1, padding: 'var(--space-6)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

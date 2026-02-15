import { marketData } from '@/lib/api';
import { mockAssets, calculateNetWorth, getAssetDistribution } from '@/lib/assets';
import { calculateTaxLiability, getProactiveActions } from '@/lib/indicators';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';
import EstateVault from '@/components/EstateVault';
import WatchlistActivity from '@/components/WatchlistActivity';

export default async function DashboardPage() {
    // Shared wealth logic
    const netWorth = calculateNetWorth(mockAssets);
    const distribution = getAssetDistribution(mockAssets);
    const taxStats = calculateTaxLiability(mockAssets);
    const actions = getProactiveActions(mockAssets);

    return (
        <div className="fade-in">
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: 'var(--space-6)' }}>Imagine Wealth</h1>

            <WealthOverview
                netWorth={netWorth}
                distribution={distribution}
                taxEfficiency={Number(taxStats.efficiency.toFixed(0))}
                riskScore={45}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* AI Guidance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <ActionCenter actions={actions} />

                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Watchlist Activity</h2>
                        <WatchlistActivity />
                    </div>
                </div>

                {/* Governance Sidebar */}
                <div>
                    <EstateVault />
                </div>
            </div>
        </div>
    );
}

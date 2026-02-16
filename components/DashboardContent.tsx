'use client';

import React, { useState, useCallback } from 'react';
import { mockAssets, calculateNetWorth, getAssetDistribution, Asset } from '@/lib/assets';
import { calculateTaxLiability, getProactiveActions } from '@/lib/indicators';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';
import EstateVault from '@/components/EstateVault';
import WatchlistActivity from '@/components/WatchlistActivity';
import { Undo2 } from 'lucide-react';

export default function DashboardContent() {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const [assets, setAssets] = useState<Asset[]>(mockAssets);
    const [history, setHistory] = useState<Asset[][]>([]);

    const netWorth = calculateNetWorth(assets);
    const distribution = getAssetDistribution(assets);
    const taxStats = calculateTaxLiability(assets);
    const actions = getProactiveActions(assets);


    const handleExecuteAction = useCallback((newAssets: Asset[]) => {
        setHistory(prev => [...prev, assets]);
        setAssets(newAssets);
    }, [assets]);

    const handleRevert = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setAssets(previous);
        setHistory(prev => prev.slice(0, -1));
    }, [history, assets]);

    if (!mounted) return null;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Imagine Wealth</h1>
                {history.length > 0 && (
                    <button
                        onClick={handleRevert}
                        className="button-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                    >
                        <Undo2 size={16} /> Revert Last AI Action
                    </button>
                )}
            </div>

            <WealthOverview
                assets={assets}
                netWorth={netWorth}
                distribution={distribution}
                taxEfficiency={Number(taxStats.efficiency.toFixed(0))}
                riskScore={45}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <ActionCenter
                        actions={actions}
                        assets={assets}
                        onExecute={handleExecuteAction}
                    />

                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Watchlist Activity</h2>
                        <WatchlistActivity />
                    </div>
                </div>

                <div>
                    <EstateVault />
                </div>
            </div>
        </div>
    );
}

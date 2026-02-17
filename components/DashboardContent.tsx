'use client';

import React, { useState, useCallback } from 'react';
import { mockAssets, calculateNetWorth, getAssetDistribution, Asset } from '@/lib/assets';
import { calculatePortfolioBeta } from '@/lib/analytics';
import { calculateTaxLiability } from '@/lib/indicators';
import { getGeminiProactiveActions } from '@/lib/gemini';
import { Action } from '@/lib/types';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';
import EstateVault from '@/components/EstateVault';
import WatchlistActivity from '@/components/WatchlistActivity';
import CSVFormatGuide from '@/components/CSVFormatGuide';
import { Undo2, FileUp, Loader2 } from 'lucide-react';

export default function DashboardContent() {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = React.useState(false);

    // ... existing mounting logic ...

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            const newAssets: Asset[] = [];

            // Skip header and parse lines: type,name,symbol,quantity,purchasePrice,currentPrice,sector
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 6) continue;

                newAssets.push({
                    id: `imported-${i}`,
                    type: parts[0].trim().toLowerCase() as any,
                    name: parts[1].trim(),
                    symbol: parts[2].trim(),
                    quantity: parseFloat(parts[3]),
                    purchasePrice: parseFloat(parts[4]),
                    currentPrice: parseFloat(parts[5]),
                    sector: parts[6]?.trim() || 'Other',
                    valuationDate: new Date().toISOString()
                });
            }

            if (newAssets.length > 0) {
                setHistory(prev => [...prev, assets]);
                setAssets(newAssets);
            }
        };
        reader.readAsText(file);
    };
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const [assets, setAssets] = useState<Asset[]>(mockAssets);
    const [history, setHistory] = useState<Asset[][]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);

    // Memoize stats to prevent unnecessary re-calculations and effect triggers
    const stats = React.useMemo(() => ({
        netWorth: calculateNetWorth(assets),
        distribution: getAssetDistribution(assets),
        taxStats: calculateTaxLiability(assets),
        beta: calculatePortfolioBeta(assets)
    }), [assets]);

    // Optimized: Reduced debounce and immediate loading state
    React.useEffect(() => {
        // Show loading immediately
        setIsActionsLoading(true);

        const timer = setTimeout(() => {
            getGeminiProactiveActions(assets, stats)
                .then(setActions)
                .finally(() => setIsActionsLoading(false));
        }, 500); // Reduced from 2s to 500ms

        return () => clearTimeout(timer);
    }, [assets, stats]);


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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="button-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FileUp size={16} /> Import CSV
                    </button>
                    <CSVFormatGuide />
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
            </div>

            <WealthOverview
                assets={assets}
                netWorth={stats.netWorth}
                distribution={stats.distribution}
                taxEfficiency={Number(stats.taxStats.efficiency.toFixed(0))}
                riskScore={45}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {isActionsLoading ? (
                        <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Gemini AI is scanning your portfolio...</p>
                        </div>
                    ) : (
                        <ActionCenter
                            actions={actions}
                            assets={assets}
                            onExecute={handleExecuteAction}
                        />
                    )}

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

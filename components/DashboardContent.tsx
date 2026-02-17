'use client';

import React, { useState, useCallback } from 'react';
import { mockAssets, calculateNetWorth, getAssetDistribution, Asset } from '@/lib/assets';
import { calculatePortfolioBeta } from '@/lib/analytics';
import { calculateTaxLiability } from '@/lib/indicators';
import { getGeminiProactiveActions } from '@/lib/gemini';
import { Action } from '@/lib/types';
import { logout, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';
import EstateVault from '@/components/EstateVault';
import WatchlistActivity from '@/components/WatchlistActivity';
import CSVFormatGuide from '@/components/CSVFormatGuide';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import { Undo2, FileUp, Loader2, LogOut, User, Check } from 'lucide-react';

export default function DashboardContent() {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();

    // ... existing mounting logic ...

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const currentUser = getCurrentUser();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            const newAssets: Asset[] = [];
            const timestamp = new Date().toISOString();

            // Improved Parsing: Handle headers and various line formats
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(',');
                if (parts.length < 6) continue;

                const type = parts[0].trim().toLowerCase();
                const name = parts[1].trim();
                const symbol = parts[2].trim() || ''; // Empty symbol for real estate is fine
                const quantity = parseFloat(parts[3]) || 0;
                const purchasePrice = parseFloat(parts[4]) || 0;
                const currentPrice = parseFloat(parts[5]) || 0;
                const sector = parts[6]?.trim() || 'Other';

                if (name && (quantity > 0 || currentPrice > 0)) {
                    newAssets.push({
                        id: `imported-${Date.now()}-${i}`,
                        type: (['stock', 'crypto', 'real_estate', 'private_equity', 'esop'].includes(type) ? type : 'stock') as any,
                        name,
                        symbol,
                        quantity,
                        purchasePrice,
                        currentPrice,
                        sector,
                        valuationDate: timestamp
                    });
                }
            }

            if (newAssets.length > 0) {
                setHistory(prev => [...prev, assets]);
                setAssets(newAssets);
                // Clear old actions to force visual "AI Scanning" state
                setActions([]);
                setIsActionsLoading(true);

                // Set temporary success status
                setImportStatus('success');
                setTimeout(() => setImportStatus('idle'), 3000);
            }
        };
        reader.readAsText(file);
        // Reset input value to allow the same file to be selected again if modified
        (event.target as HTMLInputElement).value = '';
    };
    React.useEffect(() => {
        const savedAssets = localStorage.getItem('portfolio_assets');
        if (savedAssets) {
            try {
                setAssets(JSON.parse(savedAssets));
            } catch (e) {
                console.error("Failed to load assets from cache", e);
            }
        }
        setMounted(true);
    }, []);

    const [assets, setAssets] = useState<Asset[]>(mockAssets);
    const [history, setHistory] = useState<Asset[][]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Save assets to localStorage whenever they change
    React.useEffect(() => {
        if (mounted) {
            localStorage.setItem('portfolio_assets', JSON.stringify(assets));
        }
    }, [assets, mounted]);
    const lastDataHashRef = React.useRef<string>('');

    // Memoize stats to prevent unnecessary re-calculations and effect triggers
    const stats = React.useMemo(() => ({
        netWorth: calculateNetWorth(assets),
        distribution: getAssetDistribution(assets),
        taxStats: calculateTaxLiability(assets),
        beta: calculatePortfolioBeta(assets)
    }), [assets]);

    // Optimized: Gemini Change Detection & Caching
    React.useEffect(() => {
        // Create a unique hash of the current portfolio state
        const dataHash = JSON.stringify({
            assetIds: assets.map(a => `${a.symbol}-${a.quantity}-${a.currentPrice}`),
            netWorth: stats.netWorth,
            beta: stats.beta
        });

        // Skip if data hasn't changed
        if (dataHash === lastDataHashRef.current && actions.length > 0) {
            return;
        }

        // Try to load from cache first
        const cachedActions = localStorage.getItem('gemini_proactive_actions_cache');
        const cachedHash = localStorage.getItem('gemini_proactive_actions_hash');

        if (cachedActions && cachedHash === dataHash) {
            try {
                setActions(JSON.parse(cachedActions));
                lastDataHashRef.current = dataHash;
                setIsActionsLoading(false);
                return;
            } catch (e) {
                console.error("Failed to parse cached actions", e);
            }
        }

        setIsActionsLoading(true);
        lastDataHashRef.current = dataHash;

        const timer = setTimeout(() => {
            getGeminiProactiveActions(assets, stats)
                .then(newActions => {
                    setActions(newActions);
                    // Update cache
                    localStorage.setItem('gemini_proactive_actions_cache', JSON.stringify(newActions));
                    localStorage.setItem('gemini_proactive_actions_hash', dataHash);
                })
                .finally(() => setIsActionsLoading(false));
        }, 800);

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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* User Info */}
                    {currentUser && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                            <User size={16} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{currentUser.name}</span>
                        </div>
                    )}
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
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderColor: importStatus === 'success' ? 'var(--success)' : undefined,
                            background: importStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : undefined
                        }}
                    >
                        {importStatus === 'success' ? (
                            <>
                                <Check size={16} /> Imported!
                            </>
                        ) : (
                            <>
                                <FileUp size={16} /> Import CSV
                            </>
                        )}
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
                    <button
                        onClick={handleLogout}
                        className="button-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--error)', color: 'var(--error)' }}
                        title="Logout"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <SubscriptionBanner />

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

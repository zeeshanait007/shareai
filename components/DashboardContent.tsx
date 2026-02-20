'use client';

import React, { useState, useCallback } from 'react';
import { mockAssets, calculateNetWorth, getAssetDistribution, Asset } from '@/lib/assets';
import { calculatePortfolioBeta } from '@/lib/analytics';
import { calculateTaxLiability } from '@/lib/indicators';
import { Action, DeepInsight } from '@/lib/types';
import { logout, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';

import WatchlistActivity from '@/components/WatchlistActivity';
import StockAnalysisPanel from '@/components/StockAnalysisPanel';
import { addToWatchlist } from '@/lib/watchlist';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import AddAssetModal from '@/components/AddAssetModal';
import PortfolioComparison from '@/components/PortfolioComparison';
import { Undo2, FileUp, Loader2, LogOut, User, Check, Menu, Plus, Sparkles, BrainCircuit, Zap, Sun } from 'lucide-react';
import { savePortfolioSnapshot } from '@/lib/portfolio-service';
import { read, utils } from 'xlsx';
import { useDashboard } from '@/providers/DashboardProvider';
import SaveDashboardModal from '@/components/SaveDashboardModal';
import DailyCheckInModal from '@/components/DailyCheckInModal';

export default function DashboardContent() {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = React.useState(false);
    const [selectedStock, setSelectedStock] = React.useState<string | null>(null);
    const [isAddAssetOpen, setIsAddAssetOpen] = React.useState(false);
    const router = useRouter();

    // Dashboard Context
    const {
        currentDashboardId,
        dashboards,
        saveDashboard,
        assets,
        setAssets,
        aiAssets,
        setAiAssets,
        insight: comparisonInsight,
        setInsight: setComparisonInsight
    } = useDashboard();

    // Portfolio State - now managed by context
    // const [assets, setAssets] = React.useState<Asset[]>([]); // Removed
    // const [aiAssets, setAiAssets] = React.useState<Asset[]>([]); // Removed
    const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

    // AI Insight State - now managed by context
    // const [comparisonInsight, setComparisonInsight] = React.useState<string>(""); // Removed
    const [marketNarrative, setMarketNarrative] = useState<string>('');
    const [isGeneratingInsight, setIsGeneratingInsight] = React.useState(false);

    // State for granular loading feedback
    const [isImporting, setIsImporting] = React.useState(false);
    const [isAutoSyncing, setIsAutoSyncing] = React.useState(false);

    // AI Actions State
    const [actions, setActions] = React.useState<Action[]>([]);
    const [isActionsLoading, setIsActionsLoading] = React.useState(false);
    const [showActionCenter, setShowActionCenter] = React.useState(false);
    const [showStrategyOverview, setShowStrategyOverview] = React.useState(false);
    const [isDailyCheckInOpen, setIsDailyCheckInOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Derived State (Moved up to fix hoisting issues)
    const isDemoMode = assets.length === 0;
    const displayAssets = isDemoMode ? mockAssets : assets;

    const stats = React.useMemo(() => {
        return {
            netWorth: calculateNetWorth(displayAssets),
            distribution: getAssetDistribution(displayAssets),
            taxStats: calculateTaxLiability(displayAssets),
            beta: calculatePortfolioBeta(displayAssets)
        };
    }, [displayAssets]);

    // ... [Omitted existing useEffects for localStorage saving] ...

    // Initial Load Logic
    React.useEffect(() => {
        if (!currentDashboardId && assets.length === 0 && mounted) {
            const saved = localStorage.getItem('portfolio_assets');
            if (!saved) {
                setAssets(mockAssets);
            }
        }
    }, [currentDashboardId, assets.length, mounted, setAssets]);

    // Save to local storage whenever assets change (ONLY if default dashboard)
    React.useEffect(() => {
        if (mounted && !currentDashboardId && assets.length > 0) {
            localStorage.setItem('portfolio_assets', JSON.stringify(assets));
        }
    }, [assets, mounted, currentDashboardId]);

    // Save AI assets to local storage (ONLY if default dashboard)
    React.useEffect(() => {
        if (mounted && !currentDashboardId && aiAssets.length > 0) {
            localStorage.setItem('ai_portfolio_assets', JSON.stringify(aiAssets));
        }
    }, [aiAssets, mounted, currentDashboardId]);

    // Save Insight (ONLY if default dashboard)
    React.useEffect(() => {
        if (mounted && !currentDashboardId && comparisonInsight) {
            localStorage.setItem('ai_comparison_insight', typeof comparisonInsight === 'object' ? JSON.stringify(comparisonInsight) : comparisonInsight);
        }
    }, [comparisonInsight, mounted, currentDashboardId]);

    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);

    const handleSaveAs = () => {
        setIsSaveModalOpen(true);
    };

    const handleSaveDashboard = (name: string) => {
        saveDashboard(name);
        setIsSaveModalOpen(false);
    };

    const [dailyPerformance, setDailyPerformance] = React.useState<{ dailyChangeValue: number, dailyChangePct: number, topMover: { symbol: string, changePct: number } } | null>(null);

    const syncWithAI = useCallback(async (manual = false) => {
        const currentAssets = assets.length > 0 ? assets : mockAssets;
        setIsAutoSyncing(true);
        try {
            const totalCapital = currentAssets.reduce((sum, a) => sum + (a.quantity * (a.currentPrice || a.purchasePrice)), 0);
            const response = await fetch('/api/ai/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assets: currentAssets,
                    stats,
                    totalCapital
                })
            });

            if (!response.ok) throw new Error('Sync API failed');
            const data = await response.json();

            if (data.aiAssets) setAiAssets(data.aiAssets);
            if (data.insight) setComparisonInsight(data.insight);
            if (data.actions) setActions(data.actions);
            if (data.marketNarrative) setMarketNarrative(data.marketNarrative);
            if (data.performanceMetrics) setDailyPerformance(data.performanceMetrics);
        } catch (error) {
            console.error("AI Sync failed:", error);
        } finally {
            setIsAutoSyncing(false);
        }
    }, [assets, stats, setAiAssets, setComparisonInsight, setActions, setMarketNarrative, setDailyPerformance]);

    const isSyncing = isActionsLoading || isGeneratingAI || isGeneratingInsight || isImporting || isAutoSyncing;

    const handleGenerateAI = useCallback(async () => {
        if (isSyncing) return; // Prevent double-triggering
        setIsGeneratingAI(true);
        setIsGeneratingInsight(true);

        try {
            await syncWithAI(true); // Trigger manual sync
        } catch (error) {
            console.error("Manual AI Generation Fail:", error);
        } finally {
            setIsGeneratingAI(false);
            setIsGeneratingInsight(false);
        }
    }, [isSyncing, syncWithAI]);




    // Unified Synchronization Effect (Auto-Refresh everything on Asset changes)
    // DISABLED: User requested manual trigger only for "Market Simulation"
    /*
    React.useEffect(() => {
        if (!mounted || isImporting) return; // Don't auto-sync while manually importing to avoid double-processing
        if (isDemoMode) {
            setMarketNarrative("Demo Mode: Visualize how AI optimizes this sample portfolio.");
            return; // consistent early return
        }

        const syncAllAI = async () => {
            console.log("Synchronizing institutional intelligence (Unified Mode)...");
            setIsAutoSyncing(true);

            const totalNetWorth = calculateNetWorth(assets);
            const capital = totalNetWorth > 0 ? totalNetWorth : 100000;

            try {
                // Task: Unified Sync (Replaces 3 parallel tasks for 70% latency reduction)
                const { actions, aiAssets: newAiAssets, insight, marketNarrative: newNarrative, performanceMetrics } =
                    await getUnifiedDashboardSync(assets, stats, capital);

                if (newAiAssets && newAiAssets.length > 0) {
                    setAiAssets(newAiAssets);
                }
                if (insight) {
                    setComparisonInsight(insight);
                }
                if (performanceMetrics) {
                    setDailyPerformance(performanceMetrics as any);
                }
                setActions(actions);
                setMarketNarrative(newNarrative);
            } catch (e) {
                console.error("Unified Sync Error:", e);
            } finally {
                setIsAutoSyncing(false);
            }
        };

        const timer = setTimeout(syncAllAI, 5000); // 5s debounce for lower API load
        return () => clearTimeout(timer);
    }, [assets, mounted, stats, isImporting, isDemoMode, setAiAssets, setComparisonInsight, setMarketNarrative]);
    */

    // Auto-repair for comparison insight ... [Omitted for brevity, kept same] ...
    // Auto-repair for proactive actions ... [Omitted for brevity, kept same] ...
    React.useEffect(() => {
        if (!mounted || isGeneratingInsight) return;
        const errorPhrase = "Comparison currently unavailable due to institutional data synchronization.";
        if (typeof comparisonInsight === 'string' && comparisonInsight === errorPhrase && aiAssets.length > 0) {
            const repairNormalInsight = async () => {
                setIsGeneratingInsight(true);
                try {
                    const response = await fetch('/api/ai/comparison', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assets, aiAssets })
                    });
                    if (!response.ok) throw new Error('Comparison API failed');
                    const data = await response.json();
                    setComparisonInsight(data.insight);
                } catch (error) { console.error("Auto-repair failed:", error); }
                finally { setIsGeneratingInsight(false); }
            };
            repairNormalInsight();
        }
    }, [comparisonInsight, aiAssets, assets, mounted, isGeneratingInsight, setComparisonInsight]);

    React.useEffect(() => {
        if (!mounted || isActionsLoading) return;
        const isStandby = actions.length === 1 && actions[0].title === 'AI Analysis Standby';
        if (isStandby) {
            const refreshActions = async () => {
                const currentAssets = assets.length > 0 ? assets : mockAssets;
                setIsActionsLoading(true);
                try {
                    const response = await fetch('/api/ai/actions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assets: currentAssets, stats })
                    });

                    if (!response.ok) throw new Error('Actions API failed');
                    const data = await response.json();
                    setActions(data);
                } catch (error) {
                    console.error("Failed to refresh actions:", error);
                } finally {
                    setIsActionsLoading(false);
                }
            };
            refreshActions();
        }
    }, [actions.length, assets.length, mounted, isActionsLoading, stats, assets, setActions]);

    const handleBuyStock = useCallback((symbol: string, quantity: number, price: number) => {
        const timestamp = new Date().toISOString();
        const existingAssetIndex = assets.findIndex(a => a.symbol === symbol);

        if (existingAssetIndex >= 0) {
            const updatedAssets = [...assets];
            const existing = updatedAssets[existingAssetIndex];
            updatedAssets[existingAssetIndex] = {
                ...existing,
                quantity: existing.quantity + quantity,
                purchasePrice: (existing.purchasePrice * existing.quantity + price * quantity) / (existing.quantity + quantity),
                currentPrice: price,
                valuationDate: timestamp
            };
            setAssets(updatedAssets);
        } else {
            const newAsset: Asset = {
                id: `buy-${symbol}-${Date.now()}`,
                type: 'stock',
                name: symbol, // Fallback to symbol as name if not found
                symbol,
                quantity,
                purchasePrice: price,
                currentPrice: price,
                sector: 'Technology', // Default sector
                valuationDate: timestamp
            };
            setAssets([...assets, newAsset]);
        }
    }, [assets, setAssets]);

    const handleAddToWatchlist = useCallback((symbol: string) => {
        addToWatchlist({
            symbol,
            name: symbol,
            price: 0 // Will be updated by WatchlistActivity
        });
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const currentUser = getCurrentUser();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        const processAssets = (newAssets: Asset[]) => {
            if (newAssets.length > 0) {
                setAssets(newAssets);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
            // Add a small artificial delay so the user sees the "Importing" state
            setTimeout(() => setIsImporting(false), 800);
        };

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

                const newAssets: Asset[] = [];
                const timestamp = new Date().toISOString();

                // Skip header row
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    if (!row || row.length < 6) continue;

                    const type = String(row[0] || '').trim().toLowerCase();
                    const name = String(row[1] || '').trim();
                    const symbol = String(row[2] || '').trim();
                    const quantity = parseFloat(row[3]) || 0;
                    const purchasePrice = parseFloat(row[4]) || 0;
                    const currentPrice = parseFloat(row[5]) || 0;
                    const sector = String(row[6] || 'Other').trim();

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
                processAssets(newAssets);
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Existing CSV Logic
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const lines = content.split('\n');
                const newAssets: Asset[] = [];
                const timestamp = new Date().toISOString();

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const parts = line.split(',');
                    if (parts.length < 6) continue;

                    const type = parts[0].trim().toLowerCase();
                    const name = parts[1].trim();
                    const symbol = parts[2].trim() || '';
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
                processAssets(newAssets);
            };
            reader.readAsText(file);
        }
    };

    // Auto-scroll to analysis when stock is selected
    const analysisRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (selectedStock) {
            setTimeout(() => {
                const element = document.getElementById('analysis-section');
                if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 150);
        }
    }, [selectedStock]);

    if (!mounted) return null;

    return (
        <>
            <div className="fade-in">
                {isDemoMode && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1.25rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        color: '#F59E0B',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        <BrainCircuit size={18} />
                        <span><strong>Demo Mode Active:</strong> You're viewing sample data. Load your own assets for personalized AI quantum analysis.</span>
                        <button
                            onClick={() => setIsAddAssetOpen(true)}
                            style={{
                                marginLeft: 'auto',
                                background: '#F59E0B',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Load Data
                        </button>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Imagine Wealth</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                        {/* User Info */}
                        {currentUser && (
                            <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                <User size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{currentUser.name}</span>
                            </div>
                        )}
                        <button
                            onClick={handleSaveAs}
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '120px',
                                flexShrink: 0,
                                padding: 'var(--space-2) var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                border: '1px solid var(--border)',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }}
                            title="Save Dashboard As..."
                        >
                            <FileUp size={16} className="rotate-90" /> Save As
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv, .xlsx, .xls"
                            style={{ display: 'none' }}
                        />
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => {
                                    setIsDailyCheckInOpen(!isDailyCheckInOpen);
                                    if (!isDailyCheckInOpen && actions.length === 0) {
                                        handleGenerateAI();
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: isDailyCheckInOpen ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                                    color: '#F59E0B',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    width: '150px',
                                    flexShrink: 0,
                                    fontWeight: 700,
                                    fontSize: '0.8125rem',
                                    padding: 'var(--space-2) var(--space-4)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                <Sun size={16} /> Daily Briefing
                            </button>

                            {/* Click Outside Handler */}
                            {isDailyCheckInOpen && (
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                    onClick={() => setIsDailyCheckInOpen(false)}
                                />
                            )}

                            {/* Daily Briefing Popover */}
                            <DailyCheckInModal
                                isOpen={isDailyCheckInOpen}
                                onClose={() => setIsDailyCheckInOpen(false)}
                                assets={displayAssets}
                                netWorth={calculateNetWorth(displayAssets)}
                                marketNarrative={marketNarrative}
                                topAction={actions[0]}
                                isLoading={isSyncing}
                                onRefresh={handleGenerateAI}
                                dailyPerformance={dailyPerformance}
                                quantifiedConsequences={comparisonInsight && typeof comparisonInsight === 'object' ? (comparisonInsight as DeepInsight).quantifiedConsequences : []}
                                isDemoMode={isDemoMode}
                            />
                        </div>
                        <button
                            onClick={() => setIsAddAssetOpen(true)}
                            className="btn-primary"
                            disabled={isSyncing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: isSyncing ? 0.7 : 1,
                                width: '140px',
                                flexShrink: 0,
                                padding: 'var(--space-2) var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 700,
                                fontSize: '0.8125rem',
                                boxShadow: 'var(--shadow-primary)',
                                cursor: isSyncing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isSyncing ? 'Syncing...' : 'Add Asset'}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-secondary"
                            disabled={isSyncing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: isSyncing ? 0.7 : 1,
                                width: '130px',
                                flexShrink: 0
                            }}
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                            {isSyncing ? 'Processing...' : 'Import'}
                        </button>

                        <button
                            onClick={() => {
                                const wb = utils.book_new();
                                const ws = utils.json_to_sheet([
                                    { Type: 'stock', Name: 'Apple Inc.', Symbol: 'AAPL', Quantity: 10, PurchasePrice: 150, CurrentPrice: 180, Sector: 'Technology' },
                                    { Type: 'crypto', Name: 'Bitcoin', Symbol: 'BTC', Quantity: 0.5, PurchasePrice: 40000, CurrentPrice: 52000, Sector: 'Digital Assets' },
                                    { Type: 'real_estate', Name: 'Rental Property', Symbol: 'PROP1', Quantity: 1, PurchasePrice: 200000, CurrentPrice: 250000, Sector: 'Real Estate' }
                                ]);
                                utils.book_append_sheet(wb, ws, "Portfolio");
                                import('xlsx').then(xlsx => {
                                    xlsx.writeFile(wb, "portfolio_template.xlsx");
                                });
                            }}
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '115px',
                                flexShrink: 0
                            }}
                            title="Download Sample Template"
                        >
                            <FileUp size={16} className="rotate-180" /> Template
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100px',
                                flexShrink: 0
                            }}
                            title="Logout"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <SubscriptionBanner />

                <main className="container-fluid py-6 space-y-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <WealthOverview
                            assets={displayAssets}
                            netWorth={stats.netWorth}
                            distribution={stats.distribution}
                            taxEfficiency={Number(stats.taxStats.efficiency.toFixed(0))}
                            riskScore={45}
                            narrative={marketNarrative}
                            isDemo={isDemoMode}
                            onStockClick={(symbol) => setSelectedStock(symbol)}
                        />

                        <div id="analysis-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6" ref={analysisRef}>
                                {showStrategyOverview ? (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0rem' }}>
                                            <BrainCircuit size={20} className="text-primary" />
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Strategy Overview</h3>
                                        </div>
                                        <PortfolioComparison
                                            userAssets={displayAssets}
                                            aiAssets={aiAssets}
                                            onGenerateAI={handleGenerateAI}
                                            isGenerating={isGeneratingAI}
                                            insight={comparisonInsight}
                                            isGeneratingInsight={isGeneratingInsight}
                                            isDemoMode={isDemoMode}
                                        />
                                    </div>
                                ) : (
                                    <div className="card" style={{
                                        padding: '3rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '1.5rem',
                                        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)',
                                        border: '1px solid var(--border)',
                                        textAlign: 'center',
                                        minHeight: '400px'
                                    }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <BrainCircuit size={32} className="text-primary animate-pulse" />
                                        </div>
                                        <div style={{ maxWidth: '400px' }}>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Strategy Overview</h3>
                                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                Unlock institutional-grade portfolio comparisons. Our AI simulates thousands of market scenarios to benchmark your strategy against optimal alpha-seeking allocations.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowStrategyOverview(true);
                                                handleGenerateAI();
                                            }}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '0.75rem 2rem',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Zap size={18} /> Run Market Simulation
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">
                                {/* Proactive Action Center Trigger */}
                                {!showActionCenter ? (
                                    <div className="card" style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)',
                                        border: '1px solid var(--border)',
                                        textAlign: 'center'
                                    }}>
                                        <Sparkles size={32} className="text-primary animate-pulse" />
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>AI Action Center</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Run deep analysis to see proactive portfolio optimizations.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowActionCenter(true);
                                                handleGenerateAI();
                                            }}
                                            className="btn btn-primary"
                                            style={{ width: '100%', fontSize: '0.875rem' }}
                                        >
                                            <Zap size={14} /> Run AI Analysis
                                        </button>
                                    </div>
                                ) : (
                                    <ActionCenter
                                        actions={actions}
                                        assets={assets}
                                        onExecute={setAssets}
                                        isLoading={isSyncing}
                                    />
                                )}
                                <div className="card" style={{ minHeight: '400px' }}>
                                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Watchlist Activity</h2>
                                    <WatchlistActivity onStockClick={(symbol) => setSelectedStock(symbol)} />
                                </div>
                                {selectedStock && (
                                    <div id="analysis-section" className="grid grid-cols-1 gap-6">
                                        <StockAnalysisPanel
                                            symbol={selectedStock}
                                            currentPrice={assets.find(a => a.symbol === selectedStock)?.currentPrice}
                                            onClose={() => setSelectedStock(null)}
                                            onBuy={handleBuyStock}
                                            onAddToWatchlist={handleAddToWatchlist}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <AddAssetModal
                    isOpen={isAddAssetOpen}
                    onClose={() => setIsAddAssetOpen(false)}
                    onAdd={(newAsset) => {
                        setAssets([...assets, newAsset]);
                        // Trigger AI refresh but DO NOT auto-open panel
                        setActions([]);
                    }}
                />

                <SaveDashboardModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveDashboard}
                />



            </div>
        </>
    );
}


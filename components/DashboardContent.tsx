'use client';

import React, { useState, useCallback } from 'react';
import { mockAssets, calculateNetWorth, getAssetDistribution, Asset } from '@/lib/assets';
import { calculatePortfolioBeta } from '@/lib/analytics';
import { calculateTaxLiability } from '@/lib/indicators';
import { getGeminiProactiveActions, generateAIPortfolio, getPortfolioComparisonInsight } from '@/lib/gemini';
import { Action } from '@/lib/types';
import { logout, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import WealthOverview from '@/components/WealthOverview';
import ActionCenter from '@/components/ActionCenter';
import EstateVault from '@/components/EstateVault';
import WatchlistActivity from '@/components/WatchlistActivity';
import StockAnalysisPanel from '@/components/StockAnalysisPanel';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import AddAssetModal from '@/components/AddAssetModal';
import PortfolioComparison from '@/components/PortfolioComparison';
import { Undo2, FileUp, Loader2, LogOut, User, Check, Menu, Plus } from 'lucide-react';
import { savePortfolioSnapshot } from '@/lib/portfolio-service';
import { read, utils } from 'xlsx';
import { useDashboard } from '@/providers/DashboardProvider';
import SaveDashboardModal from '@/components/SaveDashboardModal';

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
    const [isGeneratingInsight, setIsGeneratingInsight] = React.useState(false);

    // AI Actions State
    const [actions, setActions] = React.useState<Action[]>([]);
    const [isActionsLoading, setIsActionsLoading] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);

        // Initial Load Logic - if Context didn't already load it
        // The Context handles loading from localStorage or specific dashboard on mount/change.
        // So we might only need to handle the "mockAssets" fallback if the context is empty and it's the default dashboard.

        if (!currentDashboardId && assets.length === 0 && mounted) {
            // Check localStorage again or fallback to mock?
            // Context provider attempts to load from localStorage.
            // If context assets are empty, maybe we should init mockAssets?
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
            localStorage.setItem('ai_comparison_insight', comparisonInsight);
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

    const handleGenerateAI = async () => {
        setIsGeneratingAI(true);
        const totalNetWorth = calculateNetWorth(assets);
        // Ensure at least some capital for the AI to work with
        const capital = totalNetWorth > 0 ? totalNetWorth : 100000;

        // 1. Generate Assets
        const newAiAssets = await generateAIPortfolio(capital, assets);
        setAiAssets(newAiAssets);
        setIsGeneratingAI(false);

        // 2. Generate Insight (independently to not block UI)
        setIsGeneratingInsight(true);
        const insight = await getPortfolioComparisonInsight(assets, newAiAssets);
        setComparisonInsight(insight);
        setIsGeneratingInsight(false);
    };

    // Derived State
    const stats = React.useMemo(() => {
        return {
            netWorth: calculateNetWorth(assets),
            distribution: getAssetDistribution(assets),
            taxStats: calculateTaxLiability(assets),
            beta: calculatePortfolioBeta(assets)
        };
    }, [assets]);

    // Fetch AI Actions when assets change
    React.useEffect(() => {
        if (!mounted) return;

        const fetchActions = async () => {
            setIsActionsLoading(true);
            const newActions = await getGeminiProactiveActions(assets, stats);
            setActions(newActions);
            setIsActionsLoading(false);
        };

        const timer = setTimeout(fetchActions, 1000); // Debounce
        return () => clearTimeout(timer);
    }, [assets, mounted]); // stats is derived from assets, so just dependent on assets is enough basically (or memoized stats)

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const currentUser = getCurrentUser();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const processAssets = (newAssets: Asset[]) => {
            if (newAssets.length > 0) {
                setAssets(newAssets);
                setActions([]);
                setIsActionsLoading(true);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
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
            // Small delay to ensure render is complete and layout is stable
            setTimeout(() => {
                const element = document.getElementById('analysis-section');
                if (element) {
                    const headerOffset = 80; // approximate header height + padding
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 150);
        }
    }, [selectedStock]);

    if (!mounted) return null;

    return (
        <>
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
                        <button
                            onClick={handleSaveAs}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
                        <button
                            onClick={() => setIsAddAssetOpen(true)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={16} /> Add Asset
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FileUp size={16} /> Import
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
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            title="Download Sample Template"
                        >
                            <FileUp size={16} className="rotate-180" /> Template
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
                            assets={assets}
                            netWorth={stats.netWorth}
                            distribution={stats.distribution}
                            taxEfficiency={Number(stats.taxStats.efficiency.toFixed(0))}
                            riskScore={45}
                            onStockClick={(symbol) => setSelectedStock(symbol)}
                        />

                        {/* AI Portfolio Comparison */}
                        <PortfolioComparison
                            userAssets={assets}
                            aiAssets={aiAssets}
                            onGenerateAI={handleGenerateAI}
                            isGenerating={isGeneratingAI}
                            insight={comparisonInsight}
                            isGeneratingInsight={isGeneratingInsight}
                        />

                        <div id="analysis-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6" ref={analysisRef}>
                                {selectedStock ? (
                                    <StockAnalysisPanel
                                        symbol={selectedStock}
                                        currentPrice={assets.find(a => a.symbol === selectedStock)?.currentPrice}
                                        onClose={() => setSelectedStock(null)}
                                        onBuy={(symbol, qty, price) => {
                                            const newAsset: Asset = {
                                                id: `buy-${Date.now()}`,
                                                type: 'stock',
                                                name: symbol,
                                                symbol: symbol,
                                                quantity: qty,
                                                purchasePrice: price,
                                                currentPrice: price,
                                                sector: 'Technology', // Default for now, could be improved with AI
                                                valuationDate: new Date().toISOString()
                                            };
                                            setAssets([...assets, newAsset]);
                                            setSelectedStock(null);
                                        }}
                                        onAddToWatchlist={(symbol) => {
                                            // We can import addToWatchlist from lib
                                            import('@/lib/watchlist').then(mod => {
                                                mod.addToWatchlist({ symbol, name: symbol });
                                                // Force refresh of watchlist could be tricky without state lift, 
                                                // but WatchlistActivity might self-refresh on mount/interaction if we updated it to read from event or stick to simple localStorage poll
                                            });
                                        }}
                                    />
                                ) : (
                                    <ActionCenter
                                        actions={actions}
                                        assets={assets}
                                        onExecute={setAssets}
                                        isLoading={isActionsLoading}
                                    />
                                )}
                            </div>
                            <div className="space-y-6">
                                <div className="card">
                                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Watchlist Activity</h2>
                                    <WatchlistActivity onStockClick={(symbol) => setSelectedStock(symbol)} />
                                </div>
                                <EstateVault />
                            </div>
                        </div>
                    </div>
                </main>

                <AddAssetModal
                    isOpen={isAddAssetOpen}
                    onClose={() => setIsAddAssetOpen(false)}
                    onAdd={(newAsset) => {
                        setAssets([...assets, newAsset]);
                        // Trigger AI refresh
                        setActions([]);
                        setIsActionsLoading(true);
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


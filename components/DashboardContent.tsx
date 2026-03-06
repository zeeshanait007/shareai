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
import AllocationCluster from '@/components/AllocationCluster';


import StockAnalysisPanel from '@/components/StockAnalysisPanel';
import { addToWatchlist } from '@/lib/watchlist';
import AddAssetModal from '@/components/AddAssetModal';
import PortfolioComparison from '@/components/PortfolioComparison';
import { Undo2, FileUp, Loader2, LogOut, User, Check, Menu, Plus, Sparkles, BrainCircuit, Zap, Sun, Activity, Eye, EyeOff, LayoutTemplate, Layers, ShieldAlert, Wallet, Banknote, RefreshCw, Save, Target, ArrowRight } from 'lucide-react';
import { savePortfolioSnapshot } from '@/lib/portfolio-service';
import { read, utils } from 'xlsx';
import { useDashboard } from '@/providers/DashboardProvider';
import SaveDashboardModal from '@/components/SaveDashboardModal';
import DailyCheckInModal from '@/components/DailyCheckInModal';
import ConfirmModal from '@/components/ConfirmModal';
import StressTester from '@/components/StressTester';
import AIChatBot from '@/components/AIChatBot';
import ClusterIntelligence from '@/components/ClusterIntelligence';

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
        setInsight: setComparisonInsight,
        notifications,
        addNotification
    } = useDashboard();

    // Portfolio State - now managed by context
    // const [assets, setAssets] = React.useState<Asset[]>([]); // Removed
    // const [aiAssets, setAiAssets] = React.useState<Asset[]>([]); // Removed
    const [isGeneratingAI, setIsGeneratingAI] = React.useState(false);

    // AI Insight State - now managed by context
    // const [comparisonInsight, setComparisonInsight] = React.useState<string>(""); // Removed
    const [marketNarrative, setMarketNarrative] = useState<string>('');
    const [marketRegime, setMarketRegime] = useState<string>('');
    const [marketDirective, setMarketDirective] = useState<string>('');
    const [isMarketContextLoading, setIsMarketContextLoading] = useState(false);
    const hasFetchedMarketContext = React.useRef(false);
    const [isGeneratingInsight, setIsGeneratingInsight] = React.useState(false);
    const [dailyChangePct, setDailyChangePct] = React.useState<number>(2.41); // Default SIGMA

    // State for granular loading feedback
    const [isImporting, setIsImporting] = React.useState(false);
    const [isAutoSyncing, setIsAutoSyncing] = React.useState(false);

    // AI Actions State
    const [actions, setActions] = React.useState<Action[]>([]);
    const [isActionsLoading, setIsActionsLoading] = React.useState(false);
    const [showActionCenter, setShowActionCenter] = React.useState(false);
    const [showStrategyOverview, setShowStrategyOverview] = React.useState(false);
    const [isDailyCheckInOpen, setIsDailyCheckInOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'portfolio' | 'strategy'>('overview');
    const [isFocusMode, setIsFocusMode] = React.useState(false);
    const [isWideScreen, setIsWideScreen] = React.useState(false);

    // Allocation Cluster State
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    React.useEffect(() => {
        const checkWidth = () => {
            setIsWideScreen(window.innerWidth > 1600);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);



    // Confirmation State
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [confirmOptions, setConfirmOptions] = React.useState({ title: '', message: '' });
    const [onConfirm, setOnConfirm] = React.useState<(() => void) | null>(null);

    const confirmAction = () => {
        if (onConfirm) onConfirm();
        setIsConfirmOpen(false);
    };

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

    // Fetch Market Context on mount to populate AI Macro Perspective
    React.useEffect(() => {
        if (!mounted || hasFetchedMarketContext.current) return;
        hasFetchedMarketContext.current = true;

        const fetchInitialMarketContext = async () => {
            setIsMarketContextLoading(true);
            try {
                const response = await fetch('/api/ai/market-context');
                if (response.ok) {
                    const data = await response.json();
                    if (data.aiInsight) {
                        setMarketNarrative(data.aiInsight);
                    }
                    if (data.regime) {
                        setMarketRegime(data.regime);
                    }
                    if (data.directive) {
                        setMarketDirective(data.directive);
                    }
                }
            } catch (err) {
                console.error("Initial market context fetch failed:", err);
            } finally {
                setIsMarketContextLoading(false);
            }
        };

        fetchInitialMarketContext();
    }, [mounted]);

    React.useEffect(() => {
        if (mounted && !currentDashboardId && comparisonInsight) {
            localStorage.setItem('ai_comparison_insight', typeof comparisonInsight === 'object' ? JSON.stringify(comparisonInsight) : comparisonInsight);
        }
    }, [comparisonInsight, mounted, currentDashboardId]);

    // Real-time Price Polling
    React.useEffect(() => {
        if (!mounted || isDemoMode) return;

        const pollPrices = async () => {
            const symbols = assets.filter(a => a.type === 'stock' && a.symbol).map(a => a.symbol!);
            if (symbols.length === 0) return;

            try {
                const response = await fetch('/api/portfolio/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbols })
                });

                if (response.ok) {
                    const { quotes } = await response.json();

                    // Update assets with new prices
                    const updatedAssets = assets.map(asset => {
                        if (asset.symbol && quotes[asset.symbol]) {
                            return {
                                ...asset,
                                currentPrice: quotes[asset.symbol].regularMarketPrice,
                                dailyChangePercent: quotes[asset.symbol].regularMarketChangePercent
                            };
                        }
                        return asset;
                    });

                    // Only update if prices actually changed to avoid unnecessary re-renders
                    const pricesChanged = updatedAssets.some((a, i) => a.currentPrice !== assets[i].currentPrice);
                    if (pricesChanged) {
                        setAssets(updatedAssets);
                    }

                    // Calculate Portfolio Daily Change (SIGMA)
                    let totalValue = 0;
                    let totalDailyChangeValue = 0;

                    updatedAssets.forEach(a => {
                        const val = a.quantity * a.currentPrice;
                        totalValue += val;
                        if (a.dailyChangePercent !== undefined) {
                            // price_yesterday = price_today / (1 + change_pct/100)
                            // change_value = price_today - price_yesterday
                            const priceYesterday = a.currentPrice / (1 + (a.dailyChangePercent / 100));
                            const changeVal = (a.currentPrice - priceYesterday) * a.quantity;
                            totalDailyChangeValue += changeVal;
                        }
                    });

                    const portfolioPrevValue = totalValue - totalDailyChangeValue;
                    if (portfolioPrevValue > 0) {
                        const sigma = (totalDailyChangeValue / portfolioPrevValue) * 100;
                        setDailyChangePct(Number(sigma.toFixed(2)));
                    }
                }
            } catch (err) {
                console.error("Price polling failed:", err);
            }
        };

        const interval = setInterval(pollPrices, 60000); // 60s poll
        pollPrices(); // Initial poll

        return () => clearInterval(interval);
    }, [assets.length, isDemoMode, mounted]);

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
            // Removed automatic actions population to enforce on-demand generation
            // if (data.actions) setActions(data.actions); 
            if (data.marketNarrative) setMarketNarrative(data.marketNarrative);
            if (data.performanceMetrics) {
                setDailyPerformance(data.performanceMetrics);

                // Real-time Notification Generation
                if (Math.abs(data.performanceMetrics.dailyChangePct) > 2) {
                    addNotification({
                        type: 'market',
                        urgency: 'high',
                        title: 'Volatile Market Action',
                        message: `Market moves detected: ${data.performanceMetrics.dailyChangePct > 0 ? 'Surge' : 'Drop'} of ${Math.abs(data.performanceMetrics.dailyChangePct).toFixed(2)}% in portfolio value.`
                    });
                }
            }

            if (manual) {
                addNotification({
                    type: 'ai',
                    urgency: 'low',
                    title: 'Intelligence Sync Complete',
                    message: 'AI has successfully analyzed live market data and updated your strategy.'
                });
            }
        } catch (error) {
            console.error("AI Sync failed:", error);
        } finally {
            setIsAutoSyncing(false);
        }
    }, [assets, stats, setAiAssets, setComparisonInsight, setActions, setMarketNarrative, setDailyPerformance]);

    const isSyncing = isActionsLoading || isGeneratingAI || isGeneratingInsight || isImporting || isAutoSyncing;

    const handleGenerateActions = useCallback(async () => {
        if (isSyncing || isActionsLoading) return;
        setIsActionsLoading(true);
        try {
            const currentAssets = assets.length > 0 ? assets : mockAssets;
            const response = await fetch('/api/ai/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets: currentAssets, stats })
            });

            if (!response.ok) throw new Error('Actions API failed');
            const data = await response.json();
            setActions(data);

            addNotification({
                type: 'ai',
                urgency: 'low',
                title: 'Tactical Scan Complete',
                message: `${data.length} tactical opportunities identified for your portfolio.`
            });
        } catch (error) {
            console.error("Manual Actions Generation Fail:", error);
            addNotification({
                type: 'market',
                urgency: 'high',
                title: 'Scan Failed',
                message: 'Neural engine encountered a synchronization error. Please retry.'
            });
        } finally {
            setIsActionsLoading(false);
        }
    }, [isSyncing, isActionsLoading, assets, stats, addNotification]);

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
    // REMOVED: Synchronization is now strictly manual via ActionCenter trigger
    /*
    React.useEffect(() => {
        if (!mounted || isImporting) return;

        // consistent early return for demo mode or empty assets
        if (isDemoMode && assets.length === 0) {
            setMarketNarrative("Demo Mode: Visualize how AI optimizes this sample portfolio.");
        }

        const syncAllAI = async () => {
            console.log("Synchronizing institutional intelligence...");
            syncWithAI();
        };

        // 1s debounce for initial/manual changes
        const timer = setTimeout(syncAllAI, 2000);
        return () => clearTimeout(timer);
    }, [assets.length, mounted, isImporting, isDemoMode, syncWithAI]);
    */


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

    const handleAddAsset = (newAsset: Asset) => {
        setAssets(prev => [...prev, newAsset]);
        // Trigger AI refresh but DO NOT auto-open panel
        setActions([]);
    };

    const handleDeleteAsset = (id: string) => {
        const asset = assets.find(a => a.id === id);
        if (!asset) return;

        setConfirmOptions({
            title: 'Delete Asset',
            message: `Are you sure you want to remove ${asset.name} from your portfolio? This action cannot be undone.`
        });

        setOnConfirm(() => () => {
            setAssets(prev => prev.filter(a => a.id !== id));
            addNotification({
                type: 'ai',
                urgency: 'low',
                title: 'Asset Removed',
                message: `${asset.name} has been removed from your portfolio.`
            });
        });

        setIsConfirmOpen(true);
    };

    const getSelectedStockPrice = () => {
        if (!selectedStock) return 0;
        const asset = displayAssets.find(a => a.symbol === selectedStock);
        return asset?.currentPrice || 0;
    };

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
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            {/* Elite HUD Layer: Mesh & Grain */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 10%, rgba(79, 70, 229, 0.04) 0%, transparent 60%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="fade-in hud-mesh scan-line" style={{
                position: 'relative',
                zIndex: 2,
                padding: 'var(--space-4) var(--space-8)',
                maxWidth: '1800px',
                margin: '0 auto'
            }}>



                {/* Minimalist Executive Header row with Tabs - Perfectly Balanced */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    position: 'relative',
                    zIndex: 10,
                    gap: '1rem'
                }}>
                    {/* Left: Branding */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div className="shareai-logo-minimal" style={{
                            background: 'var(--primary)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Sparkles size={18} color="white" />
                        </div>
                        <div className="hidden lg:block">
                            <h1 className="precision-data" style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', margin: 0, color: 'var(--text-primary)' }}>SHARE<span style={{ color: 'var(--primary)' }}>AI</span></h1>
                            <div className="precision-data" style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>v2.1</div>
                        </div>
                    </div>

                    {/* Middle: Integrated Tabs (Centered) */}
                    <div className="dashboard-tabs" style={{ margin: 0, padding: '0.2rem', flexShrink: 0 }}>
                        <button onClick={() => setActiveTab('overview')} className={`tab-trigger ${activeTab === 'overview' ? 'active' : ''}`} style={{ padding: '0.4rem 0.8rem' }}>
                            <LayoutTemplate size={12} /> OVERVIEW
                        </button>
                        <button onClick={() => setActiveTab('portfolio')} className={`tab-trigger ${activeTab === 'portfolio' ? 'active' : ''}`} style={{ padding: '0.4rem 0.8rem' }}>
                            <Layers size={12} /> PORTFOLIO
                        </button>
                        <button onClick={() => setActiveTab('strategy')} className={`tab-trigger ${activeTab === 'strategy' ? 'active' : ''}`} style={{ padding: '0.4rem 0.8rem' }}>
                            <BrainCircuit size={12} /> STRATEGY
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsAddAssetOpen(true)} className="btn-hud" style={{ fontSize: '0.6rem', padding: '0.4rem 0.8rem' }}>
                            <Plus size={12} /> ADD
                        </button>
                        <button onClick={() => syncWithAI(true)} className="btn-hud" style={{ fontSize: '0.6rem', padding: '0.4rem 0.8rem' }} disabled={isSyncing}>
                            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} /> SYNC
                        </button>
                        <button onClick={() => setIsSaveModalOpen(true)} className="btn-hud btn-hud-primary" style={{ fontSize: '0.6rem', padding: '0.4rem 0.8rem' }}>
                            <Save size={12} /> SAVE
                        </button>
                    </div>
                </div>

                {isDemoMode && (
                    <div style={{
                        background: 'var(--primary-glow)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem 1rem',
                        marginBottom: 'var(--space-6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        color: 'var(--warning)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <BrainCircuit size={16} />
                        <span>PREVIEW MODE: Viewing AI-simulated results. Add your own assets for personalized insights.</span>
                    </div>
                )}

            </div>



            {/* ZONE 01: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="tab-content-area" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                    <WealthOverview
                        assets={displayAssets}
                        netWorth={stats.netWorth}
                        distribution={stats.distribution}
                        taxEfficiency={Number(stats.taxStats.efficiency.toFixed(0))}
                        riskScore={Math.round(stats.beta * 100)}
                        narrative={marketNarrative}
                        isDemo={isDemoMode}
                        aiAssets={aiAssets}
                        onStockClick={(symbol: string) => setSelectedStock(symbol)}
                        dailyChangePct={dailyChangePct}
                        insight={comparisonInsight as DeepInsight}
                        actions={actions}
                        isLoadingAI={isGeneratingAI}
                        marketRegime={marketRegime}
                        primaryDirective={marketDirective}
                        isMarketLoading={isMarketContextLoading}
                    />
                </div>
            )}

            {/* ZONE 02: PORTFOLIO */}
            {activeTab === 'portfolio' && (
                <div className="tab-content-area" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                    <AllocationCluster
                        assets={displayAssets}
                        netWorth={stats.netWorth}
                        aiAssets={aiAssets}
                        onStockClick={setSelectedStock}
                        onDeleteAsset={handleDeleteAsset}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        expandedCategory={expandedCategory}
                        setExpandedCategory={setExpandedCategory}
                    />
                    <ClusterIntelligence />
                </div>
            )}

            {/* ZONE 03: STRATEGY */}
            {activeTab === 'strategy' && (
                <div className="tab-content-area" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                    <ActionCenter
                        actions={actions}
                        assets={displayAssets}
                        onExecute={setAssets}
                        isLoading={isSyncing || isActionsLoading}
                        onGenerate={handleGenerateActions}
                    />
                    <div className="card glass-hull scan-effect" style={{ padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
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
                    <StressTester assets={displayAssets} />
                </div>
            )}


            {/* Stock Analysis Section (Inline) */}
            {selectedStock && (
                <div id="analysis-section" style={{ scrollMarginTop: '100px', animationDelay: '0.4s' }}>
                    <StockAnalysisPanel
                        symbol={selectedStock}
                        currentPrice={getSelectedStockPrice()}
                        onClose={() => setSelectedStock(null)}
                        onBuy={handleBuyStock}
                        onAddToWatchlist={() => addToWatchlist({ symbol: selectedStock, name: selectedStock })}
                    />
                </div>
            )}
            {/* Hidden Utils */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls" style={{ display: 'none' }} />

            {/* Modals */}
            <AddAssetModal isOpen={isAddAssetOpen} onClose={() => setIsAddAssetOpen(false)} onAdd={handleAddAsset} />
            <SaveDashboardModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveDashboard} />
            <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmAction} {...confirmOptions} />

            {/* ShareAI ChatBot - Real-time Conversational AI */}
            <AIChatBot
                assets={displayAssets}
                netWorth={stats.netWorth}
                beta={stats.beta}
                marketContext={marketNarrative}
            />
        </div>
    );
}

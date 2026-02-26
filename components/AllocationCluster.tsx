'use client';

import React from 'react';
import { PieChart, Zap, X } from 'lucide-react';
import { Asset } from '@/lib/assets';

interface AllocationClusterProps {
    assets: Asset[];
    netWorth: number;
    aiAssets?: Asset[];
    onStockClick?: (symbol: string) => void;
    onDeleteAsset?: (id: string) => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    expandedCategory: string | null;
    setExpandedCategory: (val: string | null) => void;
}

export default function AllocationCluster({
    assets,
    netWorth,
    aiAssets,
    onStockClick,
    onDeleteAsset,
    searchTerm,
    onSearchChange,
    expandedCategory,
    setExpandedCategory
}: AllocationClusterProps) {
    const distribution: Record<string, number> = {};
    assets.forEach(asset => {
        distribution[asset.type] = (distribution[asset.type] || 0) + (asset.quantity * asset.currentPrice);
    });

    const assetEntries = Object.entries(distribution).filter(([_, val]) => val > 0);

    return (
        <div className="glass-hull data-glimmer" style={{
            padding: 'var(--space-4)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)'
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                        <PieChart size={16} />
                    </div>
                    <span className="precision-data" style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15rem' }}>Allocation Cluster</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="live-pulse" />
                    <span className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Live Matrix</span>
                </div>

                <div style={{ position: 'relative', width: '220px' }}>
                    <input
                        type="text"
                        placeholder="SEARCH CLUSTERS..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
                        className="precision-data"
                        style={{
                            width: '100%',
                            padding: '0.4rem 0.8rem',
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '0.65rem',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <Zap size={12} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                {assetEntries.map(([type, value]) => {
                    const isExpanded = expandedCategory === type;
                    const categoryAssets = assets.filter(a => a.type === type);
                    const purchaseVal = categoryAssets.reduce((sum, a) => sum + (a.quantity * a.purchasePrice), 0);
                    const currentVal = categoryAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
                    const returnPct = purchaseVal > 0 ? ((currentVal - purchaseVal) / purchaseVal) * 100 : 0;

                    const sectorMap: Record<string, number> = {};
                    categoryAssets.forEach(a => {
                        const s = a.sector || 'Other';
                        sectorMap[s] = (sectorMap[s] || 0) + (a.quantity * a.currentPrice);
                    });
                    const topSectors = Object.entries(sectorMap)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([name, val]) => ({ name, pct: (val / currentVal) * 100 }));

                    const aiNetWorth = aiAssets && aiAssets.length > 0 ? aiAssets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0) : 0;
                    const aiCategoryValue = aiAssets ? aiAssets.filter(a => a.type === type).reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0) : 0;
                    const targetPct = aiNetWorth > 0 ? (aiCategoryValue / aiNetWorth) * 100 : null;
                    const currentPct = (value / netWorth) * 100;
                    const deviance = targetPct !== null ? currentPct - targetPct : 0;

                    return (
                        <div key={type} style={{ width: '100%' }}>
                            <div
                                onClick={() => setExpandedCategory(isExpanded ? null : type)}
                                className="interactive-card glass-hull"
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    background: isExpanded ? 'var(--primary-glow)' : 'var(--surface-hover)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <span className="precision-data" style={{ textTransform: 'uppercase', fontWeight: 900, fontSize: '0.85rem', color: 'var(--text-primary)', letterSpacing: '0.1rem' }}>{type.replace('_', ' ')}</span>
                                            <span className="precision-data" style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                color: returnPct >= 0 ? 'var(--success)' : 'var(--danger)',
                                                background: 'var(--surface-hover)',
                                                padding: '2px 8px',
                                                borderRadius: '6px'
                                            }}>
                                                {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            {topSectors.map(s => (
                                                <span key={s.name} className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                                    {s.name} {s.pct.toFixed(0)}%
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                            {targetPct !== null && (
                                                <div className="precision-data" style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 900,
                                                    color: Math.abs(deviance) < 5 ? 'var(--success)' : 'var(--warning)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05rem'
                                                }}>
                                                    {Math.abs(deviance) < 5 ? 'Aligned' : deviance > 0 ? 'Overweight' : 'Underweight'}
                                                </div>
                                            )}
                                            <div className="precision-data" style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                                                {currentPct.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Weight</div>
                                            {targetPct !== null && (
                                                <div className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 900 }}>
                                                    (Target: {targetPct.toFixed(1)}%)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                                    {Object.entries(sectorMap).map(([sector, val], idx) => (
                                        <div
                                            key={sector}
                                            style={{
                                                width: `${(val / currentVal) * 100}%`,
                                                height: '100%',
                                                background: type === 'stock' ? `var(--primary)` : `var(--warning)`,
                                                opacity: 1 - idx * 0.2,
                                                transition: 'width 1s ease-out'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="custom-scrollbar" style={{
                                    margin: '0.5rem 0.5rem 0 0.5rem',
                                    padding: '1rem',
                                    background: 'var(--background)',
                                    borderLeft: '2px solid var(--primary)',
                                    display: 'grid',
                                    gridTemplateColumns: categoryAssets.length > 12 ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                                    gap: '1rem',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    {categoryAssets
                                        .filter(a =>
                                            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (a.symbol && a.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
                                        )
                                        .map(asset => {
                                            const assetPerf = asset.purchasePrice > 0 ? ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100 : 0;
                                            return (
                                                <div
                                                    key={asset.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (asset.type === 'stock' && onStockClick) {
                                                            onStockClick(asset.symbol || asset.name);
                                                        }
                                                    }}
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
                                                    className="group hover:bg-[var(--surface-hover)] transition-all"
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteAsset?.(asset.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-danger/10 hover:text-danger border border-white/10 hover:border-danger/40 glass-hull"
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Remove Asset"
                                                        >
                                                            <X size={12} strokeWidth={3} />
                                                        </button>
                                                        <div>
                                                            <div className="precision-data group-hover:text-primary transition-colors" style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>{asset.name}</div>
                                                            <div className="precision-data" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{asset.symbol || 'N/A'} • {asset.quantity.toFixed(0)} UNITS</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div className="precision-data" style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                                            {`$${(asset.quantity * asset.currentPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                                                        </div>
                                                        <div className="precision-data" style={{ fontSize: '0.7rem', fontWeight: 900, color: assetPerf >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                            {assetPerf >= 0 ? '+' : ''}{assetPerf.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

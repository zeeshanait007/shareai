import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { marketData } from '@/lib/api';
import StockChart from '@/components/StockChart';
import WatchlistActivity from '@/components/WatchlistActivity';

export default async function DashboardPage() {
    // Fetch data for major indices
    const sp500 = await marketData.getQuote('^GSPC');
    const nasdaq = await marketData.getQuote('^IXIC');
    const dow = await marketData.getQuote('^DJI');

    // Fetch historical data for SP500 as the main market overview chart
    const history = await marketData.getHistoricalData('^GSPC', '1mo');

    const indices = [
        { name: 'S&P 500', data: sp500 },
        { name: 'Nasdaq', data: nasdaq },
        { name: 'Dow Jones', data: dow },
    ];

    return (
        <div className="fade-in">
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: 'var(--space-6)' }}>Market Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {/* Market Summary Cards */}
                {indices.map((index) => {
                    const isPositive = (index.data?.regularMarketChange ?? 0) >= 0;
                    return (
                        <div key={index.name} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{index.name}</span>
                                <TrendingUp
                                    size={16}
                                    color={isPositive ? "var(--success)" : "var(--danger)"}
                                    style={{ transform: isPositive ? 'none' : 'rotate(180deg)' }}
                                />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {index.data?.regularMarketPrice ? index.data.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: isPositive ? 'var(--success)' : 'var(--danger)',
                                fontSize: '0.875rem'
                            }}>
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                <span>
                                    {index.data?.regularMarketChangePercent ? `${index.data.regularMarketChangePercent > 0 ? '+' : ''}${index.data.regularMarketChangePercent.toFixed(2)}%` : '0.00%'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* Main Chart Area */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>S&P 500 Performance</h2>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Last 30 Days</span>
                    </div>
                    <div style={{ height: '400px' }}>
                        <StockChart data={history} />
                    </div>
                </div>

                {/* Top Movers */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Watchlist Activity</h2>
                    <WatchlistActivity />
                </div>
            </div>
        </div>
    );
}

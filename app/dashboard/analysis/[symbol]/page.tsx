import { marketData } from '@/lib/api';
import StockChart from '@/components/StockChart';
import WatchlistButton from '@/components/WatchlistButton';
import { calculateRSI, calculateSMA, generateRecommendation, calculateMACD, calculateBollingerBands } from '@/lib/indicators';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default async function StockAnalysisPage({ params }: { params: { symbol: string } }) {
    const symbol = decodeURIComponent(params.symbol).toUpperCase();
    const quote = await marketData.getQuote(symbol);
    const history = await marketData.getHistoricalData(symbol, '3mo');

    if (!quote) {
        return <div>Stock not found</div>;
    }

    if (!history || history.length === 0) {
        return (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>No Historical Data</h2>
                <p style={{ color: 'var(--text-secondary)' }}>We couldn't retrieve history for {symbol}. Technical analysis is unavailable.</p>
            </div>
        );
    }

    const isPositive = quote.regularMarketChange >= 0;
    const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    const changeColor = isPositive ? 'var(--success)' : 'var(--danger)';

    // Calculate Indicators
    const closePrices = history.map(h => h.close);
    const rsiValues = calculateRSI(closePrices);
    const currentRSI = rsiValues[rsiValues.length - 1] || 0;

    const sma50Values = calculateSMA(closePrices, 50);
    const currentSMA50 = sma50Values[sma50Values.length - 1] || 0;

    const macdData = calculateMACD(closePrices);
    const bollingerData = calculateBollingerBands(closePrices);

    const recommendation = generateRecommendation(quote.regularMarketPrice, currentSMA50, currentRSI, macdData, bollingerData);

    const recColor = recommendation.signal.includes('BUY') ? 'var(--success)' :
        recommendation.signal.includes('SELL') ? 'var(--danger)' : 'var(--warning)';

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>{quote.symbol}</h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{quote.shortName}</p>
                    </div>
                    <WatchlistButton symbol={quote.symbol} name={quote.shortName} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>${quote.regularMarketPrice.toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: changeColor, fontSize: '1.125rem' }}>
                        <ChangeIcon size={20} />
                        <span>{quote.regularMarketChange.toFixed(2)} ({quote.regularMarketChangePercent.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Price History</h2>
                    </div>
                    <StockChart data={history} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: `2px solid ${recColor}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: `${recommendation.score}%`, background: recColor }}></div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>AI Recommendation</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '900', color: recColor, textAlign: 'center' }}>{recommendation.signal}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Conviction: {recommendation.score}%</div>
                        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0 1rem' }}>
                            {recommendation.reason}
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Technical Health</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>RSI (14)</span>
                            <span style={{ fontWeight: 'bold', color: currentRSI > 70 ? 'var(--danger)' : currentRSI < 30 ? 'var(--success)' : 'inherit' }}>{currentRSI.toFixed(2)}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--surface-hover)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ width: `${Math.min(currentRSI, 100)}%`, height: '100%', background: currentRSI > 70 ? 'var(--danger)' : currentRSI < 30 ? 'var(--success)' : 'var(--warning)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>MACD Hist</span>
                            <span style={{ fontWeight: 'bold', color: macdData.histogram[macdData.histogram.length - 1] > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {macdData.histogram[macdData.histogram.length - 1]?.toFixed(2) || 'N/A'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>SMA (50)</span>
                            <span style={{ fontWeight: 'bold' }}>${currentSMA50 ? currentSMA50.toFixed(2) : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="card">
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} /> Market Cap
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ${(quote.marketCap / 1e9).toFixed(2)}B
                    </div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={18} /> Volume
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {/* Use last known volume if not in quote directly, though quote often has it. Fallback to history. */}
                        {history.length > 0 ? (history[history.length - 1].volume / 1e6).toFixed(2) + 'M' : 'N/A'}
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="card" style={{ border: '1px solid var(--primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                    <TrendingUp size={24} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>AI Investment Insight</h2>
                </div>
                <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Based on the technical indicators and recent market sentiment, <strong>{quote.symbol}</strong> is showing signs of
                        {isPositive ? ' strong bullish momentum.' : ' potential consolidation or bearish trend.'}
                    </p>
                    <p>
                        <strong>Action:</strong> {isPositive ? 'Consider accumulating positions on dips.' : 'Monitor for key support levels before entering.'}
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                            (This analysis is generated by algorithmic rules. For detailed fundamental analysis, upgrade to Pro.)
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

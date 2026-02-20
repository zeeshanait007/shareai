'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HistoricalData } from '@/lib/types';

interface StockChartProps {
    data: HistoricalData[];
}

export default function StockChart({ data }: StockChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const validData = data.filter(item => item && typeof item.close === 'number' && !isNaN(item.close));

    if (!validData || validData.length === 0) {
        return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Data Available</div>;
    }

    // Calculate color based on trend
    const startPrice = validData[0].close;
    const endPrice = validData[validData.length - 1].close;
    const isUp = endPrice >= startPrice;
    const strokeColor = isUp ? 'var(--success)' : 'var(--danger)';
    const fillColor = isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    if (!mounted) {
        return <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>;
    }

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={validData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                        stroke="var(--text-muted)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="var(--text-muted)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(number) => `$${number.toFixed(2)}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: '8px 12px', border: '1px solid var(--border)' }}
                        itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}
                        formatter={(value: number | undefined) => [value ? `$${value.toFixed(2)}` : '', 'Price']}
                    />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke={strokeColor}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

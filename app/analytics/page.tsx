'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserAnalytics, getRecentLogins } from '@/lib/auth';
import { Users, Clock, CheckCircle, AlertTriangle, Activity, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [logins, setLogins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [stats, recentLogins] = await Promise.all([
                    getUserAnalytics(),
                    getRecentLogins(20)
                ]);
                setAnalytics(stats);
                setLogins(recentLogins);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: `${color}15`, borderRadius: '0.75rem' }}>
                <Icon size={24} style={{ color }} />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{title}</p>
                <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{value || 0}</h3>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Analytics Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track user subscriptions and login activity</p>
                </div>

                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="animate-spin" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <StatCard title="Total Users" value={analytics?.total_users} icon={Users} color="#3b82f6" />
                            <StatCard title="Trial Users" value={analytics?.trial_users} icon={Clock} color="#f59e0b" />
                            <StatCard title="Subscribed" value={analytics?.subscribed_users} icon={CheckCircle} color="#10b981" />
                            <StatCard title="Expired" value={analytics?.expired_users} icon={AlertTriangle} color="#ef4444" />
                            <StatCard title="Total Logins" value={analytics?.total_logins} icon={Activity} color="#8b5cf6" />
                            <StatCard title="Active Days" value={analytics?.active_days} icon={Calendar} color="#ec4899" />
                        </div>

                        {/* Recent Logins Table */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Recent Login Activity</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>User</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Email</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Time</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Device</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logins.map((login: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: idx === logins.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem', fontSize: '0.925rem' }}>{login.users?.name || 'Unknown'}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>{login.users?.email}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.925rem' }}>{new Date(login.login_time).toLocaleString()}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={login.user_agent}>
                                                    {login.user_agent || 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

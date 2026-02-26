'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getSubscriptionStatusMessage, getTrialTimeRemaining } from '@/lib/subscription';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function SubscriptionBanner() {
    const [message, setMessage] = useState<string>('');
    const [hoursRemaining, setHoursRemaining] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        async function loadSubscriptionStatus() {
            const user = getCurrentUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const statusMessage = await getSubscriptionStatusMessage(user.userId);
                const hours = await getTrialTimeRemaining(user.userId);

                setMessage(statusMessage);
                setHoursRemaining(hours);
            } catch (error) {
                console.error('Error loading subscription status:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadSubscriptionStatus();

        // Refresh every minute
        const interval = setInterval(loadSubscriptionStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !message) {
        return null;
    }

    // Don't show banner for active paid subscriptions
    if (message === 'Active subscription') {
        return null;
    }

    // Determine banner style based on time remaining
    const isExpired = hoursRemaining === 0 && message.includes('expired');
    const isWarning = hoursRemaining > 0 && hoursRemaining < 24;
    const isTrial = hoursRemaining > 0;

    return (
        <div className={`hud-alert ${isExpired ? 'hud-alert-danger' : isWarning ? 'hud-alert-warning' : ''}`} style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: isExpired ? 'rgba(239, 68, 68, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    {isExpired ? (
                        <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                    ) : (
                        <Clock size={20} style={{ color: isWarning ? 'var(--warning)' : 'var(--primary)' }} />
                    )}
                </div>
                <div>
                    <p className="precision-data" style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        {message}
                    </p>
                    {isTrial && !isExpired && (
                        <p className="precision-data" style={{
                            margin: '0.2rem 0 0 0',
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Trial period ends in {hoursRemaining}h • Upgrade to retain AI Alpha access
                        </p>
                    )}
                </div>
            </div>

            {(isTrial || isExpired) && (
                <button
                    className={`btn-hud ${isExpired ? 'btn-hud-primary neon-strike' : isWarning ? 'btn-hud-warning' : 'btn-hud-primary'}`}
                    onClick={() => setShowUpgradeModal(true)}
                >
                    {isExpired ? 'REBOOT ACCESS' : 'UPGRADE SYSTEM'}
                </button>
            )}

            <ConfirmModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onConfirm={() => setShowUpgradeModal(false)}
                title="Upgrade Plan"
                message="This feature is coming soon! Stay tuned for premium features including unlimited AI analysis and real-time alerts."
                confirmText="Got it"
                type="info"
            />
        </div>
    );
}

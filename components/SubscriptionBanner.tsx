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
        <div style={{
            padding: '0.875rem 1.25rem',
            background: isExpired ? 'rgba(239, 68, 68, 0.1)' :
                isWarning ? 'rgba(251, 191, 36, 0.1)' :
                    'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.3)' :
                isWarning ? 'rgba(251, 191, 36, 0.3)' :
                    'rgba(59, 130, 246, 0.3)'}`,
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isExpired ? (
                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                ) : isTrial ? (
                    <Clock size={20} style={{ color: isWarning ? '#f59e0b' : '#3b82f6' }} />
                ) : (
                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                )}
                <div>
                    <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: isExpired ? '#ef4444' :
                            isWarning ? '#f59e0b' :
                                'var(--text)'
                    }}>
                        {message}
                    </p>
                    {isTrial && !isExpired && (
                        <p style={{
                            margin: '0.125rem 0 0 0',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                        }}>
                            Upgrade to continue using ShareAI after your trial ends
                        </p>
                    )}
                </div>
            </div>

            {(isTrial || isExpired) && (
                <button
                    className="btn btn-primary"
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap'
                    }}
                    onClick={() => setShowUpgradeModal(true)}
                >
                    {isExpired ? 'Renew Now' : 'Upgrade'}
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

import { supabase, Subscription } from './supabase';

/**
 * Check if a user's subscription is active (trial or paid)
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('status, trial_end, subscription_end')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return false;
    }

    // Check if trial is still valid
    if (data.status === 'trial') {
        const trialEnd = new Date(data.trial_end);
        return trialEnd > new Date();
    }

    // Check if paid subscription is still valid
    if (data.status === 'active' && data.subscription_end) {
        const subEnd = new Date(data.subscription_end);
        return subEnd > new Date();
    }

    return false;
}

/**
 * Get subscription details for a user
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return null;
    }

    return data as Subscription;
}

/**
 * Get remaining trial time in hours
 */
export async function getTrialTimeRemaining(userId: string): Promise<number> {
    const subscription = await getSubscription(userId);

    if (!subscription || subscription.status !== 'trial') {
        return 0;
    }

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffMs = trialEnd.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.max(0, diffHours);
}

/**
 * Create a new subscription for a user (auto-starts 2-day trial)
 */
export async function createSubscription(userId: string): Promise<Subscription | null> {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 2); // 2 days from now

    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            status: 'trial',
            trial_end: trialEnd.toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating subscription:', error);
        return null;
    }

    return data as Subscription;
}

/**
 * Upgrade from trial to paid subscription
 */
export async function upgradeToPaid(userId: string, durationMonths: number = 1): Promise<boolean> {
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'active',
            subscription_start: new Date().toISOString(),
            subscription_end: subscriptionEnd.toISOString()
        })
        .eq('user_id', userId);

    return !error;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled'
        })
        .eq('user_id', userId);

    return !error;
}

/**
 * Check and update expired trials (run periodically)
 */
export async function updateExpiredTrials(): Promise<void> {
    const { error } = await supabase.rpc('check_expired_trials');

    if (error) {
        console.error('Error updating expired trials:', error);
    }
}

/**
 * Get subscription status message for UI
 */
export async function getSubscriptionStatusMessage(userId: string): Promise<string> {
    const subscription = await getSubscription(userId);

    if (!subscription) {
        return 'No subscription found';
    }

    if (subscription.status === 'trial') {
        const hoursRemaining = await getTrialTimeRemaining(userId);
        if (hoursRemaining > 24) {
            const daysRemaining = Math.ceil(hoursRemaining / 24);
            return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left in trial`;
        } else if (hoursRemaining > 0) {
            return `${Math.ceil(hoursRemaining)} hour${Math.ceil(hoursRemaining) > 1 ? 's' : ''} left in trial`;
        } else {
            return 'Trial expired';
        }
    }

    if (subscription.status === 'active') {
        return 'Active subscription';
    }

    if (subscription.status === 'expired') {
        return 'Subscription expired';
    }

    if (subscription.status === 'cancelled') {
        return 'Subscription cancelled';
    }

    return 'Unknown status';
}

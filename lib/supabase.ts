import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing. Database functionality will be unavailable.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    trial_start: string;
    trial_end: string;
    subscription_start: string | null;
    subscription_end: string | null;
    created_at: string;
    updated_at: string;
}

export interface LoginTracking {
    id: string;
    user_id: string;
    login_time: string;
    ip_address: string | null;
    user_agent: string | null;
}

export interface UserAnalytics {
    total_users: number;
    trial_users: number;
    subscribed_users: number;
    expired_users: number;
    total_logins: number;
    active_days: number;
    weekly_active_users: number;
    monthly_active_users: number;
}

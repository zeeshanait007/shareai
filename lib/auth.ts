import { supabase, User } from './supabase';
import { createSubscription } from './subscription';
import bcrypt from 'bcryptjs';

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export interface Session {
    userId: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    expiresAt: number;
}

/**
 * Track user login
 */
async function trackLogin(userId: string): Promise<void> {
    // Get IP and user agent (in a real app, you'd get these from the request)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    await supabase
        .from('login_tracking')
        .insert({
            user_id: userId,
            user_agent: userAgent,
            ip_address: null // Will be set by server-side code if needed
        });
}

/**
 * Register a new user
 */
export async function register(
    email: string,
    password: string,
    name: string
): Promise<{ success: boolean; error?: string; user?: Omit<User, 'password_hash'> }> {
    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                email,
                password_hash: passwordHash,
                name,
                role: 'user'
            })
            .select('id, email, name, role, created_at, updated_at')
            .single();

        if (userError || !newUser) {
            console.error('Supabase user creation error details:', userError);
            return {
                success: false,
                error: userError?.message || 'Failed to create user - check if tables are created'
            };
        }

        // Create subscription (2-day trial)
        await createSubscription(newUser.id);

        return {
            success: true,
            user: newUser as Omit<User, 'password_hash'>
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}

/**
 * Login user
 */
export async function login(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string; user?: Omit<User, 'password_hash'> }> {
    try {
        // Get user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Track login
        await trackLogin(user.id);

        // Create session
        const session: Session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            expiresAt: Date.now() + SESSION_DURATION
        };

        // Store session in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('session', JSON.stringify(session));
        }

        const { password_hash, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword as Omit<User, 'password_hash'>
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

/**
 * Logout user
 */
export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('session');
    }
}

/**
 * Get current session
 */
export function getSession(): Session | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) {
        return null;
    }

    try {
        const session: Session = JSON.parse(sessionStr);

        // Check if session is expired
        if (session.expiresAt < Date.now()) {
            logout();
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getSession() !== null;
}

/**
 * Get current user
 */
export function getCurrentUser(): Omit<Session, 'expiresAt'> | null {
    const session = getSession();
    if (!session) {
        return null;
    }

    const { expiresAt, ...user } = session;
    return user;
}

/**
 * Extend session
 */
export function extendSession(): boolean {
    const session = getSession();
    if (!session) {
        return false;
    }

    session.expiresAt = Date.now() + SESSION_DURATION;

    if (typeof window !== 'undefined') {
        localStorage.setItem('session', JSON.stringify(session));
    }

    return true;
}

/**
 * Get session time remaining in milliseconds
 */
export function getSessionTimeRemaining(): number {
    const session = getSession();
    if (!session) {
        return 0;
    }

    return Math.max(0, session.expiresAt - Date.now());
}

/**
 * Get user analytics (admin only)
 */
export async function getUserAnalytics() {
    const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }

    return data;
}

/**
 * Get recent logins (admin only)
 */
export async function getRecentLogins(limit: number = 50) {
    const { data, error } = await supabase
        .from('login_tracking')
        .select(`
            *,
            users (email, name)
        `)
        .order('login_time', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent logins:', error);
        return [];
    }

    return data;
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/lib/auth';
import { TrendingUp, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (isLogin) {
            const result = await login(email, password);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Login failed');
                setIsLoading(false);
            }
        } else {
            // Registration
            if (!name.trim()) {
                setError('Please enter your name');
                setIsLoading(false);
                return;
            }

            const result = await register(email, password, name);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Registration failed');
                setIsLoading(false);
            }
        }
    };

    const fillCredentials = (userEmail: string, userPassword: string) => {
        setEmail(userEmail);
        setPassword(userPassword);
        setIsLogin(true);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            background: 'var(--primary)',
                            borderRadius: '0.75rem',
                            display: 'flex'
                        }}>
                            <TrendingUp size={28} style={{ color: 'white' }} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>ShareAI</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {/* Login/Register Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    {/* Toggle Login/Register */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        background: 'var(--card-bg)',
                        padding: '0.25rem',
                        borderRadius: '0.5rem'
                    }}>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '0.625rem',
                                background: isLogin ? 'var(--primary)' : 'transparent',
                                color: isLogin ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '0.625rem',
                                background: !isLogin ? 'var(--primary)' : 'transparent',
                                color: !isLogin ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Name (only for registration) */}
                        {!isLogin && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required={!isLogin}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 3rem',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.5rem',
                                color: 'var(--text-secondary)'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.5rem',
                                color: 'var(--text-secondary)'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 3rem 0.75rem 3rem',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Trial Info for Registration */}
                        {!isLogin && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'center'
                            }}>
                                🎉 Get <strong style={{ color: 'var(--primary)' }}>2 days free trial</strong> when you sign up!
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.5rem',
                                color: '#ef4444',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            {isLoading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}

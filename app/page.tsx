'use client';

import { ArrowRight, TrendingUp, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to dashboard if already logged in
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) {
    return null; // Prevent flash of content
  }

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <section style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in">
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Market Intelligence <br /> Redefined.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Advanced analytics and AI-powered insights for the modern investor. Track, analyze, and optimize your portfolio with precision.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary">
            <LogIn size={18} style={{ marginRight: '0.5rem' }} />
            Sign In to Get Started
          </Link>
          <a href="#features" className="btn">
            Explore Features
          </a>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card fade-in" style={{ animationDelay: '100ms' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
            <TrendingUp size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Real-time Analytics</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track market movements with precision. Get instant updates on your favorite stocks and sectors.
          </p>
        </div>

        <div className="card fade-in" style={{ animationDelay: '200ms' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--success)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Insights</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Leverage cutting-edge AI to get personalized recommendations and deep semantic analysis of market news.
          </p>
        </div>

        <div className="card fade-in" style={{ animationDelay: '300ms' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--warning)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Portfolio Optimization</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Advanced tools to rebalance and optimize your holdings for maximum returns strategies.
          </p>
        </div>
      </div>
    </main>
  );
}

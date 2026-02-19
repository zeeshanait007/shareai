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
    // Clear potentially stale session data before rendering landing page
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      // We keep localStorage for persistence (auth session, portfolio) 
      // but clear session-specific build hashes
      localStorage.removeItem('last_build_check');
      localStorage.removeItem('gemini_proactive_actions_hash');
    }

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
      <section style={{ textAlign: 'center', marginBottom: '6rem' }} className="fade-in">
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to bottom, #fff 30%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Market Intelligence <br /> Redefined.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
          Advanced quantum analytics and AI-powered insights for institutional-grade portfolio management.
          Experience a unified field theory of finance—where data meets intuition.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
            <LogIn size={20} style={{ marginRight: '0.5rem' }} />
            Start Your Analysis
          </Link>
          <a href="#demo" className="btn" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem', border: '1px solid var(--border)' }}>
            Watch the Demo
          </a>
        </div>

        {/* Demo Video Container */}
        <div id="demo" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: '#000',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          aspectRatio: '16 / 9',
          position: 'relative'
        }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src="/market_intelligence_final_demo_1771502180969.webp" type="video/webp" />
            Your browser does not support the video tag.
          </video>
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

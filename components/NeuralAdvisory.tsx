'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Terminal, ShieldCheck, Zap, Maximize2, Minimize2 } from 'lucide-react';

export default function NeuralAdvisory() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Institutional node synchronized. Neural Advisory active. How shall we refine the capital allocation strategy today?', time: '09:00:01' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setMessages(prev => [...prev, { role: 'user', text: input, time: timestamp }]);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: 'Analyzing portfolio covariance... Alpha signal detected in TECH REBOUND trajectory. Suggest tactical shift to semi-conductor nodes.',
                time: new Date().toLocaleTimeString('en-US', { hour12: false })
            }]);
        }, 1000);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="glass-hull neon-strike fade-in"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    boxShadow: 'var(--shadow-neon)'
                }}
            >
                <Bot size={28} color="white" />
            </button>
        );
    }

    return (
        <div className="glass-hull fade-in" style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '400px',
            height: '600px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 51,
            background: 'rgba(9, 11, 16, 0.95)',
            border: '1px solid var(--primary-glow)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="neon-strike" style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--grad-primary)' }}>
                        <Terminal size={16} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural_Advisory</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--success)', fontWeight: 800 }}>+QUANTUM ENCRYPTION ACTIVE</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Minimize2 size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsOpen(false)} />
                </div>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Session Baseline: 2026-02-20</span>
                </div>

                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', opacity: 0.6 }}>
                            {msg.role === 'assistant' ? <Bot size={10} style={{ color: 'var(--primary)' }} /> : <User size={10} />}
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, fontFamily: 'monospace' }}>{msg.time}</span>
                        </div>
                        <div style={{
                            padding: '0.875rem 1.125rem',
                            borderRadius: '16px',
                            background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${msg.role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'var(--border)'}`,
                            maxWidth: '85%',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            lineHeight: 1.5,
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Capability Badges */}
            <div style={{ padding: '0.5rem 1.25rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <ShieldCheck size={10} color="var(--success)" /> Port_Security
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <Zap size={10} color="var(--primary)" /> Alpha_Scan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <Sparkles size={10} color="var(--accent)" /> AI CORES: 3
                </div>
            </div>

            {/* Footer Input */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'rgba(9, 11, 16, 0.98)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Inquire capital allocation logic..."
                        style={{
                            width: '100%',
                            padding: '0.85rem 3rem 0.85rem 1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.85rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        className="interactive-card"
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

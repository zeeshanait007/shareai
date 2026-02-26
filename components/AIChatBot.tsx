'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, User, BrainCircuit, LineChart, TrendingUp, HelpCircle } from 'lucide-react';
import { Asset } from '@/lib/assets';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface AIChatBotProps {
    assets: Asset[];
    netWorth: number;
    beta: number;
    marketContext?: string;
}

export default function AIChatBot({ assets, netWorth, beta, marketContext }: AIChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I'm your ShareAI Assistant. How can I help you with your portfolio or the market today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    assets,
                    stats: { netWorth, beta },
                    marketContext
                })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');
            const data = await response.json();

            setMessages(prev => [...prev, { role: 'model', content: data.response }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickQuestions = [
        "How is my portfolio doing?",
        "What are the top market risks today?",
        "Should I rebalance my assets?",
        "Any stock suggestions?"
    ];

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="neon-strike interactive-card"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--grad-primary)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <MessageSquare size={28} color="white" />
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        background: 'var(--success)',
                        borderRadius: '50%',
                        border: '2px solid var(--background)',
                        animation: 'pulse 2s infinite'
                    }} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="glass-hull fade-in" style={{
                    width: '400px',
                    height: '600px',
                    background: 'rgba(13, 16, 23, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--glass-border)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="neon-strike" style={{ width: '40px', height: '40px', background: 'var(--grad-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BrainCircuit size={22} color="white" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>ShareAI Assistant</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                                    <div style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                gap: '0.75rem',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {msg.role === 'user' ? <User size={16} color="#3B82F6" /> : <Sparkles size={16} color="var(--primary)" />}
                                </div>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '0.875rem 1.125rem',
                                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={16} className="animate-spin" color="var(--primary)" />
                                </div>
                                <div style={{ padding: '0.875rem 1.125rem', borderRadius: '4px 18px 18px 18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Analyzing portfolio data...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length < 3 && !isLoading && (
                        <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(q); }}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '2rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="interactive-card"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything about your money..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '0.875rem 3.5rem 0.875rem 1.125rem',
                                    fontSize: '0.9rem',
                                    color: 'white',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    position: 'absolute',
                                    right: '6px',
                                    top: '6px',
                                    bottom: '6px',
                                    width: '40px',
                                    background: input.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    color: input.trim() ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <BrainCircuit size={10} /> Powered by ShareAI Gemini Engine V2
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

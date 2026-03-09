import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Loader, HelpCircle, MessageCircle, Bug, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { value: 'general', label: 'General Inquiry', icon: HelpCircle },
    { value: 'account', label: 'Account Issue', icon: MessageCircle },
    { value: 'bug', label: 'Bug Report', icon: Bug },
    { value: 'billing', label: 'Billing / Premium', icon: CreditCard },
];

export const SupportPage = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [form, setForm] = useState({
        name: profile?.display_name || '',
        email: user?.email || '',
        category: 'general',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) return;

        setStatus('submitting');
        try {
            const res = await fetch('https://formsubmit.co/ajax/support@ineedam.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: form.name || 'Anonymous',
                    email: form.email || 'No email provided',
                    _subject: `[Ineedam Support] [${CATEGORIES.find(c => c.value === form.category)?.label}] ${form.subject}`,
                    message: form.message,
                    category: form.category,
                    _template: 'table',
                    _honey: '', // Honeypot field for spam prevention
                    _captcha: 'false' // Can disable captcha for AJAX if needed, though usually handled by FormSubmit
                }),
            });
            const data = await res.json();
            if (data.success === 'true' || data.success === true) {
                setStatus('success');
            } else {
                console.error("FormSubmit Error:", data);
                setStatus('error');
            }
        } catch (err) {
            console.error("Submission error:", err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); navigate(-1); }}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', cursor: 'pointer' }}
                    className="nav-link-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Contact Support</h2>
            </header>

            {status === 'success' ? (
                /* Success State */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.3))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CheckCircle size={40} color="var(--accent)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '360px' }}>
                            We've received your message and will get back to you at <strong>{form.email || 'your email'}</strong> as soon as possible.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2rem', borderRadius: '9999px' }}
                    >
                        Back to Home
                    </button>
                </div>
            ) : (
                <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
                    {/* Intro */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>How can we help?</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Fill in the form below and our team will get back to you within 24 hours.</p>
                    </div>

                    {/* Category Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                        {CATEGORIES.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setForm(p => ({ ...p, category: value }))}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer',
                                    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                                    border: form.category === value ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                    background: form.category === value ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                                    color: form.category === value ? 'var(--primary)' : 'var(--text-muted)',
                                }}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Your Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Jane Doe"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Subject</label>
                            <input
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="Briefly describe your issue"
                                required
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Describe your issue in detail. The more context you provide, the faster we can help."
                                required
                                rows={6}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Something went wrong.
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Please ensure you've <strong>verified your email</strong> if this is your first time using this support tool.
                                    Alternatively, email us directly at:
                                </p>
                                <a href="mailto:support@ineedam.com" style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                                    support@ineedam.com
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'submitting' || !form.subject.trim() || !form.message.trim()}
                            className="btn btn-primary"
                            style={{ padding: '0.85rem', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {status === 'submitting' ? <><Loader size={18} className="animate-spin" /> Sending…</> : <><Send size={18} /> Send Message</>}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Or email us directly at{' '}
                            <a href="mailto:support@ineedam.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                support@ineedam.com
                            </a>
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
};

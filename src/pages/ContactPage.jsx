import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Loader, Phone, Mail, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const ContactPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            const res = await fetch('https://formsubmit.co/ajax/admin@ineedam.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    ...form,
                    _subject: `[Ineedam Contact] ${form.subject}`,
                    _template: 'table',
                    _captcha: 'false'
                }),
            });
            const data = await res.json();
            if (data.success === 'true' || data.success === true) {
                setStatus('success');
                if (isBottomSheetOpen) {
                    setTimeout(() => setIsBottomSheetOpen(false), 2000);
                }
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error("Submission error:", err);
            setStatus('error');
        }
    };

    const ContactForm = ({ compact = false }) => (
        <div style={{ 
            background: compact ? 'transparent' : 'var(--bg-surface)', 
            padding: compact ? '0' : '1.5rem', 
            borderRadius: '20px', 
            border: compact ? 'none' : '1px solid var(--border-glass)',
        }}>
            {status === 'success' ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem', padding: '1rem 0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sent!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We'll get back to you shortly.</p>
                    </div>
                    {!isBottomSheetOpen && (
                        <button onClick={() => setStatus('idle')} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}>Send Another</button>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@email.com"
                                style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</label>
                        <input
                            type="text"
                            name="subject"
                            required
                            value={form.subject}
                            onChange={handleChange}
                            placeholder="What's this about?"
                            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
                        <textarea
                            name="message"
                            required
                            value={form.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="How can we help?"
                            style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="btn btn-primary"
                        style={{ padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 700 }}
                    >
                        {status === 'submitting' ? <><Loader size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
                    </button>

                    {status === 'error' && (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                            Couldn't send. Please try again.
                        </p>
                    )}
                </form>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Helmet>
                <title>Contact Us - Ineedam</title>
                <meta name="description" content="Get in touch with Ineedam. We are here to help you connect needs with solutions." />
            </Helmet>

            {/* Removed Header for a cleaner look */}

            <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem 1rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', width: '100%' }}>
                    
                    {/* Info Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                                    className="nav-link-hover"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                            </div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                                Let's get in <span className="text-gradient">touch</span>.
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                                Have a question or feedback? We'd love to hear from you.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0rem' }}>Phone</p>
                                    <a href="tel:+2348054714548" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>+234 805 471 4548</a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0rem' }}>Email</p>
                                    <a href="mailto:admin@ineedam.com" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>admin@ineedam.com</a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0rem' }}>Office</p>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Lagos, Nigeria</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile CTA */}
                        <div className="mobile-only" style={{ display: 'none', marginTop: '1rem' }}>
                            <button 
                                className="btn btn-primary"
                                onClick={() => { setStatus('idle'); setIsBottomSheetOpen(true); }}
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                            >
                                <Send size={20} /> Send Message
                            </button>
                        </div>
                    </div>

                    {/* Desktop Form Section */}
                    <div className="desktop-only" style={{ display: 'block' }}>
                        <ContactForm />
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Sheet */}
            {isBottomSheetOpen && (
                <div className="bottom-sheet-overlay" onClick={() => setIsBottomSheetOpen(false)}>
                    <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Send Message</h3>
                        <ContactForm compact />
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                    main { padding-top: 2rem !important; }
                    h1 { font-size: 2.5rem !important; }
                }
            `}} />
        </div>
    );
};

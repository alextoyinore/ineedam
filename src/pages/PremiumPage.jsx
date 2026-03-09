import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, Shield, UserPlus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const PremiumPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <UserPlus className="text-primary" size={24} />,
            title: 'Unconditional Endorsements',
            description: 'Endorse anyone, anytime—even without a confirmed "Met" need. Boost credibility instantly.'
        },
        {
            icon: <Shield className="text-accent" size={24} />,
            title: 'Verified Badge',
            description: 'Stand out from the crowd with an exclusive Verified Premium badge on your profile and posts.'
        },
        {
            icon: <Zap className="text-secondary" size={24} />,
            title: 'Priority Visibility',
            description: 'Your needs and broadcasts get priority placement in Search and For You feeds.'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Header */}
            <header className="sticky-header" style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>iNeedAm Premium</h2>
            </header>

            <div style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', margin: '0 auto', width: '100%' }}>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(236, 72, 153, 0.15))',
                        marginBottom: '1.5rem',
                        position: 'relative'
                    }}>
                        <Sparkles size={40} className="text-gradient" />
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            boxShadow: 'none'
                        }}>
                            COMING SOON
                        </div>
                    </div>

                    <h1 className="h1" style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                        Supercharge your <span className="text-gradient">Impact</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 4vw, 1.1rem)', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 0.5rem auto' }}>
                        Get ready to unlock exclusive tools to boost your trust, reach more people, and help faster.
                    </p>
                </motion.div>

                {/* Features List */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '3rem' }}>
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            style={{
                                display: 'flex',
                                gap: 'clamp(0.75rem, 3vw, 1.25rem)',
                                padding: 'clamp(1rem, 4vw, 1.5rem)',
                                background: 'var(--bg-surface)',
                                borderRadius: '20px',
                                border: '1px solid var(--border-glass)',
                                boxShadow: 'none',
                                alignItems: 'flex-start'
                            }}
                        >
                            <div style={{
                                width: 'clamp(40px, 10vw, 48px)', height: 'clamp(40px, 10vw, 48px)', borderRadius: '14px',
                                background: 'rgba(16, 185, 129, 0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {React.cloneElement(feature.icon, { size: 'clamp(20px, 5vw, 24px)' })}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: 'clamp(1.05rem, 4.5vw, 1.1rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 3.5vw, 0.95rem)', lineHeight: 1.5 }}>
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA / Waitlist Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ width: '100%', textAlign: 'center' }}
                >
                    <div style={{
                        padding: '2rem',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Join the Waitlist</h3>
                            <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9, fontSize: '0.95rem' }}>Be the first to know when Premium drops and get an early-bird discount.</p>
                            <button className="btn" style={{ background: 'white', color: 'var(--text-primary)', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '1rem', border: 'none' }}>
                                Notify Me
                            </button>
                        </div>
                        {/* Decorative background shapes */}
                        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
                        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 0 }} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ShieldCheck } from 'lucide-react';

export const AboutPage = () => {
    return (
        <div style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* Hero Section */}
                <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 className="h1" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                        The Marketplace of <span className="text-gradient">Demand</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                        Ineedam was born from a simple realization: the internet is great at showing you what's for sale, but terrible at helping you find what you actually need.
                    </p>
                </header>

                {/* Core Philosophy */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
                    <div style={{ padding: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '24px' }}>
                        <Target className="text-gradient" size={32} style={{ marginBottom: '1rem' }} />
                        <h3 className="h3" style={{ marginBottom: '0.75rem' }}>Demand First</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We flip the script. Instead of vendors screaming for attention, we empower seekers to broadcast their needs clearly.
                        </p>
                    </div>
                    <div style={{ padding: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '24px' }}>
                        <Users className="text-gradient" size={32} style={{ marginBottom: '1rem' }} />
                        <h3 className="h3" style={{ marginBottom: '0.75rem' }}>Community Driven</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Real people, real solutions. We believe the local community is the most powerful solved-state for any problem.
                        </p>
                    </div>
                </div>

                {/* The Story Section */}
                <section style={{ marginBottom: '5rem' }}>
                    <h2 className="h2" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Our Story</h2>
                    <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            We started Ineedam in 2026 after seeing countless friends struggle to find specialized help that didn't fit into a standard "service" box. Whether it was someone needing help moving a sofa two blocks away, or a developer looking for a very specific API integration expert, the search was always fragmented across social media, forums, and local boards.
                        </p>
                        <p>
                            Ineedam provides a unified beacon for these needs. It's a place where the "not quite standard" becomes standard. By allowing users to tag helpers and build a reputation based on fulfillment, we're building a trust layer for the modern gig economy.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section style={{ padding: '4rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '32px' }}>
                    <h2 className="h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>What we stand for</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Zap size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Transparency</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No hidden fees or algorithms prioritizing paid listings. Real needs, visible to all.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <ShieldCheck size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Trust</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A reputation system built on actual fulfillment and community validation.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </motion.div>
        </div>
    );
};

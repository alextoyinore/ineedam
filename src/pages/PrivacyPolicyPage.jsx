import React from 'react';
import { motion } from 'framer-motion';

export const PrivacyPolicyPage = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Last updated: October 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>1. Information We Collect</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We collect information you provide directly to us when you create an account, post a need, reply to a thread, or otherwise communicate with us. This includes your name, email address, and the contents of your posts.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>2. How We Use Your Information</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We use the information we collect to operate, maintain, and provide the features and functionality of the Service. We also use this information to communicate with you and personalize your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>3. Data Sharing and Disclosure</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Your posted needs and replies are public and visible to anyone on the platform. We do not sell your personal information to third parties. We may share anonymous/aggregated data for analytics purposes.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';

export const TermsOfServicePage = () => {
    return (
        <div style={{ padding: '2rem var(--feed-item-padding)', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Last updated: February 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>1. Acceptance of Terms</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            By accessing or using Ineedam, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>2. Content and Conduct</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
                            You agree not to post any Content that is unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>3. Termination</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>4. Disclaimer of Warranties</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranty of any kind, express or implied. Ineedam does not guarantee the accuracy, completeness, or usefulness of any content posted by users.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>5. Limitation of Liability</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Ineedam shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. Ineedam is a connection platform only and is not responsible for transactions, agreements, or disputes between users.
                        </p>
                    </section>

                    <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 className="h2" style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>6. Contact Us</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            If you have questions about these Terms, please contact us at{' '}
                            <a href="mailto:support@ineedam.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@ineedam.com</a>.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

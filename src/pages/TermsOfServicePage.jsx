import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const TermsOfServicePage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '1rem var(--feed-item-padding) 4rem var(--feed-item-padding)', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: '2rem' }}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                    className="nav-link-hover"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Last updated: March 13, 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>1. Acceptance of Terms</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            By accessing or using Ineedam ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service. You must be at least 18 years of age to use this platform. Use of the Service by anyone under 18 is strictly prohibited unless supervised by a legal guardian.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>2. Content and Conduct</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You retain all your ownership rights to your Content, but by posting it, you grant Ineedam a non-exclusive, worldwide, royalty-free license to use, store, and display that Content in connection with providing the Service.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
                            You are solely responsible for the legality, reliability, and appropriateness of the Content you post. You agree not to post any Content that is unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>3. Prohibited Use</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            You agree not to use the Service:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts.</li>
                            <li>To harass, abuse, insult, harm, defame, slander, or intimidate others based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
                            <li>To upload or transmit viruses or any other type of malicious code.</li>
                            <li>To collect or track the personal information of others or "scrape" Content for commercial use.</li>
                            <li>To interfere with the security features of the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>4. Intellectual Property</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Ineedam and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Ineedam.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>5. Termination</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>6. Disclaimer of Warranties</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Ineedam makes no representations or warranties of any kind, express or implied, as to the operation of the Service, or the information, content, or materials included therein.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>7. Limitation of Liability</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Ineedam shall not be liable for any indirect, incidental, special, consequential, or punitive damages. We are a connection platform only and are not responsible for any transactions, agreements, or disputes that arise between users offline or outside the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>8. Governing Law</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is registered, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 className="h2" style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>9. Contact Us</h2>
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

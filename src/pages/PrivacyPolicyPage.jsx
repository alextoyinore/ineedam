import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Last updated: March 13, 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>1. Information We Collect</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We collect information you provide directly to us when you create an account, post a need, reply to a thread, or otherwise communicate with us. This includes your name, email address, username, profile picture, and the contents of your posts.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
                            We also automatically collect certain information when you access our Service, including your IP address, browser type, operating system, and details about your use of our Service (like timestamps and pages viewed).
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>2. How We Use Your Information</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We use the information we collect to operate, maintain, and provide the features and functionality of the Service. This includes:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>Connecting you with other users based on your needs.</li>
                            <li>Sending you notifications and technical notices.</li>
                            <li>Monitoring and analyzing trends, usage, and activities.</li>
                            <li>Detecting, investigating, and preventing fraudulent or illegal activities.</li>
                            <li>Personalizing your experience on the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>3. Data Sharing and Disclosure</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Your posted needs, replies, and profile information are public and visible to anyone on the platform. We do not sell your personal information to third parties. We may share information with service providers who perform services for us, or as required by law to comply with legal processes or protect the rights and safety of our users.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>4. Data Security</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, no internet or email transmission is ever fully secure or error-free. You should take special care in deciding what information you share through the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>5. Data Retention</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we may retain certain information as required by law or for legitimate business purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>6. Children's Privacy</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Ineedam is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>7. International Data Transfers</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Ineedam is based in the cloud and processes information globally. By using the Service, you consent to the transfer of your information to servers that may be located outside your home country, where data protection laws may differ.
                        </p>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>8. Your Rights</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            You have the right to access, update, or delete your personal information. You can manage your profile settings within the app or contact us directly to exercise these rights. You may also opt out of receiving promotional communications from us.
                        </p>
                    </section>

                    <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 className="h2" style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>9. Contact Us</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            If you have questions about this Privacy Policy or our data practices, please reach out to us at{' '}
                            <a href="mailto:support@ineedam.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@ineedam.com</a>.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

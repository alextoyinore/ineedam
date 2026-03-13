import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const RuleOfEngagementPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '1rem 2rem 4rem 2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
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
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Rules of Engagement</h1>

                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    Welcome to iNeedam! To ensure a safe, respectful, and productive environment for everyone, we ask all users to adhere to the following rules, both on our platform and when engaging with others in the physical world.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>1. Platform Etiquette</h2>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>Be Respectful:</strong> Treat everyone with kindness and respect. Harassment, hate speech, and abusive language are strictly prohibited.</li>
                            <li><strong>Stay on Topic:</strong> Keep your needs, offers, and replies relevant. Do not spam or use the platform for unsolicited advertising.</li>
                            <li><strong>Honesty and Transparency:</strong> Be truthful about your needs and what you can offer. Do not misrepresent yourself or your intentions.</li>
                            <li><strong>Respect Privacy:</strong> Do not share personal information of others without their explicit consent.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>2. Personal Safety & Real-World Engagements</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                            When an interaction begins on iNeedam and extends into the physical world (e.g., meeting to fulfill a need or deliver an item), your safety is our top priority. Please observe these critical safety guidelines:
                        </p>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong>Meet in Public:</strong> Always arrange to meet in well-lit, public locations during daylight hours (e.g., coffee shops, malls, or local police station trading zones).</li>
                            <li><strong>Bring a Friend:</strong> Whenever possible, do not go alone to a meetup. Bring a friend or family member with you.</li>
                            <li><strong>Inform Others:</strong> Tell someone you trust where you are going, who you are meeting, and approximately when you will return.</li>
                            <li><strong>Trust Your Instincts:</strong> If a situation or person makes you feel uncomfortable, cancel the meeting or leave immediately. Your safety is more important than completing a transaction.</li>
                            <li><strong>Do Not Share Undue Personal Information:</strong> Avoid giving out your home address, financial details, or other sensitive information unless absolutely necessary and you fully trust the other party.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>3. Reporting Violations</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            If you experience or witness any behavior that violates these Rules of Engagement, either online or in person, please report it to us immediately using the in-app reporting tools or by contacting support. In case of immediate physical danger, always contact your local emergency services first.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

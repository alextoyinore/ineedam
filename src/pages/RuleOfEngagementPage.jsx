import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users, AlertTriangle, MessageSquare, Star, Lock } from 'lucide-react';

const RuleSection = ({ number, icon: Icon, iconColor = 'var(--primary)', title, children }) => (
    <section style={{
        padding: '1.5rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-glass)',
        borderRadius: '20px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `color-mix(in srgb, ${iconColor}, transparent 88%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: iconColor, flexShrink: 0
            }}>
                <Icon size={18} />
            </div>
            <h2 className="h2" style={{ fontSize: '1.2rem', margin: 0 }}>{number}. {title}</h2>
        </div>
        {children}
    </section>
);

const RuleList = ({ items }) => (
    <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0 }}>
        {items.map((item, i) => (
            <li key={i}>{item.bold ? <><strong style={{ color: 'var(--text-primary)' }}>{item.bold}:</strong> {item.text}</> : item}</li>
        ))}
    </ul>
);

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
                <h1 className="h1" style={{ marginBottom: '0.75rem', fontSize: '2.5rem' }}>Rules of Engagement</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    Welcome to Ineedam. Our community thrives on trust, respect, and genuine connection. These rules exist to protect everyone — the people asking for help and the people offering it.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <RuleSection number="1" icon={Users} title="Platform Etiquette">
                        <RuleList items={[
                            { bold: 'Be Respectful', text: 'Treat everyone with kindness. Harassment, hate speech, threats, and abusive language of any kind will result in immediate account suspension.' },
                            { bold: 'Stay on Topic', text: 'Keep your needs, offers, and replies relevant to the platform\'s purpose. Do not spam, post unrelated content, or use the platform for unsolicited advertising.' },
                            { bold: 'Be Honest', text: 'Be truthful about your needs, budget, timeline, and what you can offer. Misrepresentation damages the community and may lead to account removal.' },
                            { bold: 'Respect Privacy', text: 'Do not publicly share another user\'s personal information, contact details, or private messages without their explicit consent.' },
                            { bold: 'No Duplicate Posts', text: 'Avoid posting the same need multiple times. Update your existing post if circumstances change.' },
                            { bold: 'Appropriate Content Only', text: 'Do not post content that is illegal, sexually explicit, violent, or otherwise objectionable. Ineedam is a professional community platform.' },
                        ]} />
                    </RuleSection>

                    <RuleSection number="2" icon={Shield} iconColor="var(--accent)" title="Personal Safety & Real-World Meetups">
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.95rem' }}>
                            When a connection made on Ineedam leads to a physical meeting, your safety must come first. Please follow these guidelines:
                        </p>
                        <RuleList items={[
                            { bold: 'Meet in Public', text: 'Always arrange first meetings in well-lit, busy public places — coffee shops, malls, or designated police-approved trading zones.' },
                            { bold: 'Bring a Friend', text: 'Whenever possible, do not go to a meetup alone. Having someone with you significantly increases your safety.' },
                            { bold: 'Tell Someone', text: 'Before any meeting, inform a trusted person of your destination, who you are meeting, and your expected return time.' },
                            { bold: 'Trust Your Instincts', text: 'If something feels wrong, cancel the meeting or leave immediately. Your safety is always more important than completing a transaction.' },
                            { bold: 'Limit Personal Information', text: 'Avoid sharing your home address, financial details, or other sensitive information until you fully trust the other party.' },
                            { bold: 'Verify Before You Pay', text: 'Never send money in advance without verifying a person\'s identity and service. If a deal sounds too good to be true, it probably is.' },
                        ]} />
                    </RuleSection>

                    <RuleSection number="3" icon={MessageSquare} iconColor="var(--secondary)" title="Communication Standards">
                        <RuleList items={[
                            { bold: 'Respond Promptly', text: 'If someone replies to your need, acknowledge them within a reasonable time. Ignoring people without reason is disrespectful and harms your Response Rate.' },
                            { bold: 'Close the Loop', text: 'Once a need is fulfilled, mark it as "Met" and tag or endorse the person who helped. This builds trust for the whole community.' },
                            { bold: 'No Unsolicited DMs', text: 'Do not send direct messages to users who have not engaged on your post or shown interest in what you\'re offering.' },
                            { bold: 'Constructive Replies Only', text: 'When replying to a need, provide genuine, relevant, and helpful information. Negative or dismissive comments are not welcome.' },
                        ]} />
                    </RuleSection>

                    <RuleSection number="4" icon={Star} iconColor="#f59e0b" title="Endorsements & Reputation">
                        <RuleList items={[
                            { bold: 'Endorse Honestly', text: 'Only endorse users who have genuinely helped fulfil a need. Fake or coerced endorsements undermine the trust layer of the platform.' },
                            { bold: 'No Endorsement Trading', text: 'Exchanging endorsements without actual fulfillment is strictly prohibited and will result in both endorsements being removed.' },
                            { bold: 'No Self-Promotion Abuse', text: 'Do not create multiple accounts to boost your own reputation. Such activity will result in permanent bans.' },
                        ]} />
                    </RuleSection>

                    <RuleSection number="5" icon={Lock} iconColor="var(--text-secondary)" title="Prohibited Activities">
                        <RuleList items={[
                            { bold: 'No Illegal Transactions', text: 'The platform must not be used to buy, sell, or facilitate anything illegal under applicable law.' },
                            { bold: 'No Scamming or Fraud', text: 'Any form of deception, phishing, fake listings, or financial fraud will be immediately reported to the authorities and result in a permanent ban.' },
                            { bold: 'No Impersonation', text: 'Do not create an account pretending to be another person, brand, or organisation.' },
                            { bold: 'No Automated Scraping', text: 'Using bots, scrapers, or automated tools to collect data from the platform is strictly prohibited.' },
                        ]} />
                    </RuleSection>

                    <RuleSection number="6" icon={AlertTriangle} iconColor="#ef4444" title="Reporting Violations">
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.95rem' }}>
                            If you experience or witness any behavior that violates these rules — online or in person — please act:
                        </p>
                        <RuleList items={[
                            { bold: 'Use In-App Reporting', text: 'Every post, reply, and profile has a report option. Use it. Our moderation team reviews all reports.' },
                            { bold: 'Contact Support', text: 'For urgent matters, email us directly at admin@ineedam.com with as much detail as possible.' },
                            { bold: 'Emergency First', text: 'In any situation involving immediate physical danger, contact your local emergency services before anything else.' },
                            { bold: 'No Vigilantism', text: 'Do not take matters into your own hands or publicly shame users. Report violations through official channels.' },
                        ]} />
                    </RuleSection>

                </div>

                <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        By using Ineedam, you agree to abide by these rules. Violations may result in warnings, temporary suspension, or permanent account removal. We reserve the right to update these rules as the community grows.
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

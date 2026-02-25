import React from 'react';
import { motion } from 'framer-motion';
import { Home, Bookmark, Search, User, MessageSquare, Sparkles, HelpCircle, Info } from 'lucide-react';

const HelpSection = ({ title, icon: Icon, children }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)'
            }}>
                <Icon size={20} />
            </div>
            <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
        </div>
        <div style={{ paddingLeft: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {children}
        </div>
    </div>
);

export const HelpPage = () => {
    return (
        <div style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 className="h1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>App Help & Navigation</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Learn how to navigate and use Ineedam effectively.</p>
                </header>

                <HelpSection title="Home Feed" icon={Home}>
                    <p>The <strong>Home Feed</strong> is where you see the latest needs and endorsements from the community. You can toggle between <em>"For You"</em> (algorithmic feed) and <em>"Following"</em> to see posts from people you know.</p>
                </HelpSection>

                <HelpSection title="Finding Needs" icon={Search}>
                    <p>Use the <strong>Search</strong> bar or the <strong>Explore</strong> section to find specific needs by category, keyword, or location. Looking for something specific? Just type it in!</p>
                </HelpSection>

                <HelpSection title="Saving for Later" icon={Bookmark}>
                    <p>Found a need you want to track? Click the <strong>Bookmark</strong> icon on any post. You can access all your saved items through the <em>"Bookmarks"</em> tab in the navigation.</p>
                </HelpSection>

                <HelpSection title="Posting a Need" icon={MessageSquare}>
                    <p>Use the <strong>Post</strong> button to create your own need. Be as descriptive as possible, and don't forget to set a budget if applicable. Community members will reply with proposals or help.</p>
                </HelpSection>

                <HelpSection title="Endorsements" icon={Sparkles}>
                    <p>When someone provides a great service, you can <strong>Endorse</strong> them. This builds trust in the community. You can find endorsements on a user's profile or in the main feed.</p>
                </HelpSection>

                <HelpSection title="Your Profile" icon={User}>
                    <p>Access your <strong>Profile</strong> to see your own needs, your history of helping others, and who you are following. You can also edit your bio and avatar from here.</p>
                </HelpSection>

                <div style={{
                    marginTop: '4rem',
                    padding: '2rem',
                    borderRadius: '24px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    textAlign: 'center'
                }}>
                    <HelpCircle size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Still have questions?</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Check our <a href="/faq" style={{ color: 'var(--primary)', textDecoration: 'none' }}>FAQ</a> or reach out to us through the contact page.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

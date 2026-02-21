import React from 'react';
import { motion } from 'framer-motion';

export const AboutPage = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="h1" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>About Ineedam</h1>

                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Ineedam is a platform dedicated to connecting people who have specific needs with those who can provide the solutions. Whether you're looking for a skilled developer, a rare vintage item, or local plumbing services, Ineedam flips the traditional marketplace model backwards: start with the demand, and let the supply come to you.
                </p>

                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '2rem', marginTop: '3rem' }}>
                    <h2 className="h2" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Our Mission</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        To reduce the friction of finding exactly what you need by creating a transparent, community-driven ecosystem where needs are broadcasted cleanly and resolved efficiently. We believe that by focusing on genuine needs first, we can foster more meaningful commerce and connection.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

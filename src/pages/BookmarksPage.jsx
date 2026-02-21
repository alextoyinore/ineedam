import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { useBookmarks } from '../context/BookmarksContext';
import needsData from '../data/needs.json';
import { Link } from 'react-router-dom';

export const BookmarksPage = () => {
    const { bookmarkedIds } = useBookmarks();

    // Filter the mock data list down to only IDs that exist in the bookmarkedIds array
    const bookmarkedNeeds = needsData.filter(need => bookmarkedIds.includes(need.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header className="sticky-header" style={{
                padding: '1rem 1.5rem'
            }}>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Bookmarks
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '0.25rem' }}>
                    @{/* This would ideally use the logged in user context */}alext
                </p>
            </header>

            {/* Feed List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {bookmarkedNeeds.length > 0 ? (
                    bookmarkedNeeds.map((need, index) => (
                        <motion.div
                            key={need.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                borderBottom: '1px solid var(--border-glass)',
                                padding: '1.5rem',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer'
                            }}
                            className="nav-link-hover"
                        >
                            <NeedCard need={need} />
                        </motion.div>
                    ))
                ) : (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
                            <Bookmark size={48} color="var(--text-secondary)" />
                        </div>
                        <h2 className="h2" style={{ color: 'var(--text-primary)', margin: 0 }}>Save posts for later</h2>
                        <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                            Don't let the good ones get away! Bookmark a need to easily find it again in the future.
                        </p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Explore Needs
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
};

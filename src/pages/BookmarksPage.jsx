import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Loader } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { ChatMessageBookmarkCard } from '../components/messages/ChatMessageBookmarkCard';
import { useBookmarks } from '../context/BookmarksContext';
import { useAuth } from '../context/AuthContext';
import { fetchBookmarkedItems } from '../lib/bookmarkService';
import { shapeNeed, timeAgo } from '../lib/needsService';
import { Link } from 'react-router-dom';

export const BookmarksPage = () => {
    const { user, profile } = useAuth();
    const { bookmarkedIds } = useBookmarks();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        const loadBookmarkedItems = async () => {
            setLoading(true);
            try {
                const data = await fetchBookmarkedItems(user.id);
                // Shape data for each type
                const shaped = data.map(item => {
                    if (item.type === 'need') {
                        return { ...shapeNeed(item), type: 'need' };
                    }
                    if (item.type === 'endorsement') {
                        return {
                            ...item,
                            type: 'endorsement',
                            postedAt: timeAgo(item.created_at)
                        };
                    }
                    return item;
                });
                setItems(shaped);
            } catch (err) {
                console.error("Failed to load bookmarked items", err);
            } finally {
                setLoading(false);
            }
        };

        loadBookmarkedItems();
    }, [user, bookmarkedIds]); // Re-fetch if user or bookmarks change state

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header className="sticky-header" style={{
                padding: '1rem var(--feed-item-padding)'
            }}>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Bookmarks
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '0.25rem' }}>
                    @{profile?.username || user?.email?.split('@')[0] || 'user'}
                </p>
            </header>

            {/* Feed List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                        <Loader className="animate-spin" size={32} />
                    </div>
                ) : items.length > 0 ? (
                    items.map((item, index) => (
                        <motion.div
                            key={`${item.type}-${item.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {item.type === 'need' ? (
                                <NeedCard need={item} />
                            ) : item.type === 'endorsement' ? (
                                <EndorsementFeedCard endorsement={item} />
                            ) : (
                                <ChatMessageBookmarkCard message={item} />
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
                            <Bookmark size={48} color="var(--text-secondary)" />
                        </div>
                        <h2 className="h2" style={{ color: 'var(--text-primary)', margin: 0 }}>Save items for later</h2>
                        <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                            Don't let the good ones get away! Bookmark a need or endorsement to easily find it again in the future.
                        </p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Explore Feed
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
};

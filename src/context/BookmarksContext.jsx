import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchBookmarks, toggleBookmarkInDb } from '../lib/bookmarkService';

const BookmarksContext = createContext(undefined);

export const BookmarksProvider = ({ children }) => {
    const { user } = useAuth();
    const [bookmarkedIds, setBookmarkedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch bookmarks from Supabase when user changes
    useEffect(() => {
        if (!user) {
            setBookmarkedIds([]);
            setLoading(false);
            return;
        }

        const loadBookmarks = async () => {
            setLoading(true);
            try {
                const ids = await fetchBookmarks(user.id);
                setBookmarkedIds(ids);
            } catch (err) {
                console.error("Failed to load bookmarks context", err);
            } finally {
                setLoading(false);
            }
        };

        loadBookmarks();
    }, [user]);

    const toggleBookmark = async (id) => {
        if (!user) {
            alert("Please sign in to bookmark needs.");
            return;
        }

        const isCurrentlyBookmarked = bookmarkedIds.includes(id);

        // Optimistic UI update
        setBookmarkedIds(prev =>
            isCurrentlyBookmarked
                ? prev.filter(bookmarkId => bookmarkId !== id)
                : [...prev, id]
        );

        // Background DB sync
        try {
            await toggleBookmarkInDb(user.id, id, isCurrentlyBookmarked);
        } catch (err) {
            console.error("Failed to sync bookmark to DB, reverting state", err);
            // Revert on failure
            setBookmarkedIds(prev =>
                isCurrentlyBookmarked
                    ? [...prev, id]
                    : prev.filter(bookmarkId => bookmarkId !== id)
            );
        }
    };

    const isBookmarked = (id) => bookmarkedIds.includes(id);

    return (
        <BookmarksContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarksContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarksContext);
    if (context === undefined) {
        throw new Error('useBookmarks must be used within a BookmarksProvider');
    }
    return context;
};

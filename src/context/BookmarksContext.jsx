import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchBookmarks, toggleBookmarkInDb } from '../lib/bookmarkService';

const BookmarksContext = createContext(undefined);

export const BookmarksProvider = ({ children }) => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]); // [{id, type}, ...]
    const [loading, setLoading] = useState(true);

    // Fetch bookmarks from Supabase when user changes
    useEffect(() => {
        if (!user) {
            setBookmarks([]);
            setLoading(false);
            return;
        }

        const loadBookmarks = async () => {
            setLoading(true);
            try {
                const items = await fetchBookmarks(user.id);
                setBookmarks(items);
            } catch (err) {
                console.error("Failed to load bookmarks context", err);
            } finally {
                setLoading(false);
            }
        };

        loadBookmarks();
    }, [user]);

    const toggleBookmark = async (id, type = 'need') => {
        if (!user) {
            alert("Please sign in to bookmark items.");
            return;
        }

        const isCurrentlyBookmarked = bookmarks.some(b => b.id === id && b.type === type);

        // Optimistic UI update
        setBookmarks(prev =>
            isCurrentlyBookmarked
                ? prev.filter(b => !(b.id === id && b.type === type))
                : [...prev, { id, type }]
        );

        // Background DB sync
        try {
            await toggleBookmarkInDb(user.id, id, isCurrentlyBookmarked, type);
        } catch (err) {
            console.error("Failed to sync bookmark to DB, reverting state", err);
            // Revert on failure
            setBookmarks(prev =>
                isCurrentlyBookmarked
                    ? [...prev, { id, type }]
                    : prev.filter(b => !(b.id === id && b.type === type))
            );
        }
    };

    const isBookmarked = (id, type = 'need') => bookmarks.some(b => b.id === id && b.type === type);

    return (
        <BookmarksContext.Provider value={{ bookmarkedIds: bookmarks.map(b => b.id), toggleBookmark, isBookmarked }}>
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

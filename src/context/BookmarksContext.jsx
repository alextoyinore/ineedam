import React, { createContext, useContext, useState, useEffect } from 'react';

const BookmarksContext = createContext(undefined);

export const BookmarksProvider = ({ children }) => {
    // Initialize from localStorage if available, otherwise empty array
    const [bookmarkedIds, setBookmarkedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('app-bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Save to localStorage whenever bookmarks change
    useEffect(() => {
        localStorage.setItem('app-bookmarks', JSON.stringify(bookmarkedIds));
    }, [bookmarkedIds]);

    const toggleBookmark = (id) => {
        setBookmarkedIds(prev =>
            prev.includes(id)
                ? prev.filter(bookmarkId => bookmarkId !== id)
                : [...prev, id]
        );
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

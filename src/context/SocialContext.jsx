import React, { createContext, useContext, useState, useEffect } from 'react';

const SocialContext = createContext();

export const SocialProvider = ({ children }) => {
    // Stores an array of user 'names' or 'ids' that the current user follows
    const [following, setFollowing] = useState(() => {
        const saved = localStorage.getItem('social_following');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('social_following', JSON.stringify(following));
    }, [following]);

    const isFollowing = (userId) => following.includes(userId);

    const toggleFollow = (userId) => {
        setFollowing(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <SocialContext.Provider value={{ following, toggleFollow, isFollowing }}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) throw new Error('useSocial must be used within a SocialProvider');
    return context;
};

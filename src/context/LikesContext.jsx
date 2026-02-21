import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserLikes, toggleLike as toggleLikeApi } from '../lib/likesService';

const LikesContext = createContext();

export const LikesProvider = ({ children }) => {
    const { user } = useAuth();
    const [likedNeedIds, setLikedNeedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLikes = async () => {
            if (!user) {
                setLikedNeedIds([]);
                setLoading(false);
                return;
            }
            try {
                const ids = await fetchUserLikes(user.id);
                setLikedNeedIds(ids);
            } catch (err) {
                console.error("Failed to load user likes:", err);
            } finally {
                setLoading(false);
            }
        };

        loadLikes();
    }, [user]);

    const isLiked = (needId) => likedNeedIds.includes(needId);

    const toggleLike = async (needId) => {
        if (!user) {
            alert("Please sign in to like posts.");
            return;
        }

        const currentlyLiked = isLiked(needId);

        // Optimistic UI update
        setLikedNeedIds(prev =>
            currentlyLiked
                ? prev.filter(id => id !== needId)
                : [...prev, needId]
        );

        try {
            await toggleLikeApi(user.id, needId, currentlyLiked);
        } catch (err) {
            console.error("Failed to toggle like:", err);
            // Revert on error
            setLikedNeedIds(prev =>
                currentlyLiked
                    ? [...prev, needId]
                    : prev.filter(id => id !== needId)
            );
            alert("Could not update like. Please try again.");
        }
    };

    return (
        <LikesContext.Provider value={{ likedNeedIds, isLiked, toggleLike, loadingLikes: loading }}>
            {children}
        </LikesContext.Provider>
    );
};

export const useLikes = () => {
    const context = useContext(LikesContext);
    if (!context) throw new Error('useLikes must be used within a LikesProvider');
    return context;
};

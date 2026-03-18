import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserLikes, toggleLike as toggleLikeApi } from '../lib/likesService';

const LikesContext = createContext();

export const LikesProvider = ({ children }) => {
    const { user } = useAuth();
    const [likedNeedIds, setLikedNeedIds] = useState([]);
    const [likedReplyIds, setLikedReplyIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLikes = async () => {
            if (!user) {
                setLikedNeedIds([]);
                setLoading(false);
                return;
            }
            try {
                const { needIds, replyIds } = await fetchUserLikes(user.id);
                setLikedNeedIds(needIds || []);
                setLikedReplyIds(replyIds || []);
            } catch (err) {
                console.error("Failed to load user likes:", err);
            } finally {
                setLoading(false);
            }
        };

        loadLikes();
    }, [user]);

    const isLiked = (id, type = 'need') => {
        if (type === 'reply') return likedReplyIds.includes(id);
        return likedNeedIds.includes(id);
    };

    const toggleLike = async (id, type = 'need') => {
        if (!user) {
            alert("Please sign in to like posts.");
            return;
        }

        const currentlyLiked = isLiked(id, type);
        const setIds = type === 'reply' ? setLikedReplyIds : setLikedNeedIds;

        // Optimistic UI update
        setIds(prev =>
            currentlyLiked
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );

        try {
            if (type === 'reply') {
                await toggleLikeApi(user.id, null, currentlyLiked, id);
            } else {
                await toggleLikeApi(user.id, id, currentlyLiked);
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
            // Revert on error
            setIds(prev =>
                currentlyLiked
                    ? [...prev, id]
                    : prev.filter(item => item !== id)
            );
            alert("Could not update like. Please try again.");
        }
    };

    return (
        <LikesContext.Provider value={{ likedNeedIds, likedReplyIds, isLiked, toggleLike, loadingLikes: loading }}>
            {children}
        </LikesContext.Provider>
    );
};

export const useLikes = () => {
    const context = useContext(LikesContext);
    if (!context) throw new Error('useLikes must be used within a LikesProvider');
    return context;
};

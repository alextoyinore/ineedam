import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { checkFollowStatus, followUser, unfollowUser, getFollowStats } from '../lib/socialService';
import { supabase } from '../lib/supabase';

const SocialContext = createContext();

export const SocialProvider = ({ children }) => {
    const { user } = useAuth();
    const [following, setFollowing] = useState([]); // Array of user IDs the current user follows
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setFollowing([]);
            setLoading(false);
            return;
        }

        const fetchFollowing = async () => {
            const { data, error } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            if (!error && data) {
                setFollowing(data.map(f => f.following_id));
            }
            setLoading(false);
        };

        fetchFollowing();

        // Optional: Real-time subscription for follows
        const channel = supabase
            .channel('follows_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'follows',
                filter: `follower_id=eq.${user.id}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setFollowing(prev => [...new Set([...prev, payload.new.following_id])]);
                } else if (payload.eventType === 'DELETE') {
                    setFollowing(prev => prev.filter(id => id !== payload.old.following_id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const isFollowing = (userId) => following.includes(userId);

    const toggleFollow = async (targetUserId) => {
        if (!user) return;

        const currentlyFollowing = isFollowing(targetUserId);
        try {
            if (currentlyFollowing) {
                setFollowing(prev => prev.filter(id => id !== targetUserId));
                await unfollowUser(user.id, targetUserId);
            } else {
                setFollowing(prev => [...prev, targetUserId]);
                await followUser(user.id, targetUserId);
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
            // Rollback state if error?
            if (currentlyFollowing) {
                setFollowing(prev => [...prev, targetUserId]);
            } else {
                setFollowing(prev => prev.filter(id => id !== targetUserId));
            }
        }
    };

    return (
        <SocialContext.Provider value={{ following, toggleFollow, isFollowing, loading }}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) throw new Error('useSocial must be used within a SocialProvider');
    return context;
};

import { supabase } from './supabase';
import { createNotification } from './notificationService';

/**
 * Follow a user and notify them.
 */
export const followUser = async (followerId, followingId) => {
    const { data, error } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) {
        if (error.code === '23505') return null; // Already following
        throw error;
    }

    // Try to send notification
    try {
        await createNotification(
            followingId,
            'follow',
            followerId,
            'started following you'
        );
    } catch (notifyErr) {
        console.error("Failed to send follow notification:", notifyErr);
    }

    return data;
};

/**
 * Unfollow a user.
 */
export const unfollowUser = async (followerId, followingId) => {
    const { data, error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
    return data;
};

/**
 * Check if a user is following another user.
 */
export const checkFollowStatus = async (followerId, followingId) => {
    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .match({ follower_id: followerId, following_id: followingId })
        .maybeSingle();

    if (error) throw error;
    return !!data;
};

/**
 * Get follower counts.
 */
export const getFollowStats = async (userId) => {
    const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);

    return {
        followersCount: followers.count || 0,
        followingCount: following.count || 0
    };
};

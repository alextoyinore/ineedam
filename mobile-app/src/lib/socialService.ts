import { supabase } from './supabase';
import { createNotification } from './notificationService';

/**
 * Follow a user and notify them.
 */
export const followUser = async (followerId: any, followingId: any) => {
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
export const unfollowUser = async (followerId: any, followingId: any) => {
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
export const checkFollowStatus = async (followerId: any, followingId: any) => {
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
export const getFollowStats = async (userId: any) => {
    const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);

    return {
        followersCount: followers.count || 0,
        followingCount: following.count || 0
    };
};

/**
 * Get the list of profiles following a specific user.
 */
export const getFollowers = async (userId: any) => {
    const { data, error } = await supabase
        .from('follows')
        .select(`
            follower_id,
            profiles!follows_follower_id_fkey (
                id, display_name, username, avatar_url, bio
            )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching followers:", error);
        return [];
    }
    return data.map(row => row.profiles).filter(Boolean);
};

/**
 * Get the list of profiles a specific user is following.
 */
export const getFollowing = async (userId: any) => {
    const { data, error } = await supabase
        .from('follows')
        .select(`
            following_id,
            profiles!follows_following_id_fkey (
                id, display_name, username, avatar_url, bio
            )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching following:", error);
        return [];
    }
    return data.map(row => row.profiles).filter(Boolean);
};

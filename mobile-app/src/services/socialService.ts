import { supabase } from '../lib/supabase';

export const followUser = async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) {
        if (error.code === '23505') return null; // Already following
        throw error;
    }
    return data;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
    return data;
};

export const isFollowing = async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .match({ follower_id: followerId, following_id: followingId })
        .maybeSingle();

    if (error) throw error;
    return !!data;
};

export const checkFollowStatus = isFollowing;

export const toggleFollow = async (followerId: string, followingId: string) => {
    const following = await isFollowing(followerId, followingId);
    if (following) {
        return await unfollowUser(followerId, followingId);
    } else {
        return await followUser(followerId, followingId);
    }
};

export const getFollowStats = async (userId: string) => {
    const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);

    return {
        followersCount: followers.count || 0,
        followingCount: following.count || 0
    };
};

export const getFollowers = async (userId: string) => {
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
    return data.map((row: any) => row.profiles).filter(Boolean);
};

export const getFollowing = async (userId: string) => {
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
    return data.map((row: any) => row.profiles).filter(Boolean);
};

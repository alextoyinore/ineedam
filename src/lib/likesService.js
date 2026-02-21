import { supabase } from './supabase';

/**
 * Toggle a like for a need.
 * @param {string} userId 
 * @param {string} needId 
 * @param {boolean} currentlyLiked 
 */
export const toggleLike = async (userId, needId, currentlyLiked) => {
    if (!userId || !needId) return;

    if (currentlyLiked) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('need_id', needId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('likes')
            .insert([{ user_id: userId, need_id: needId }]);
        if (error) throw error;
    }
};

/**
 * Fetch all need IDs liked by a user.
 * @param {string} userId 
 */
export const fetchUserLikes = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('likes')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user likes:", error);
        return [];
    }

    return data.map(item => item.need_id);
};

/**
 * Get the total like count for a need.
 * @param {string} needId 
 */
export const getLikeCount = async (needId) => {
    const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

    if (error) {
        console.error("Error fetching like count:", error);
        return 0;
    }

    return count;
};

/**
 * Fetch like counts for multiple needs.
 * returns an object mapping needId -> count
 */
export const fetchMultipleLikeCounts = async (needIds) => {
    if (!needIds?.length) return {};

    const { data, error } = await supabase
        .from('likes')
        .select('need_id');

    if (error) {
        console.error("Error fetching multiple like counts:", error);
        return {};
    }

    const counts = {};
    data.forEach(item => {
        counts[item.need_id] = (counts[item.need_id] || 0) + 1;
    });

    return counts;
};

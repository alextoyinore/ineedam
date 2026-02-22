import { supabase } from './supabase';

/**
 * Toggle a broadcast for a need.
 * @param {string} userId
 * @param {string} needId
 * @param {boolean} currentlyBroadcasted
 */
export const toggleBroadcast = async (userId, needId, currentlyBroadcasted) => {
    if (!userId || !needId) return;

    if (currentlyBroadcasted) {
        const { error } = await supabase
            .from('broadcasts')
            .delete()
            .eq('user_id', userId)
            .eq('need_id', needId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('broadcasts')
            .insert([{ user_id: userId, need_id: needId }]);
        if (error) throw error;
    }
};

/**
 * Fetch all need IDs broadcast by a user.
 * @param {string} userId
 */
export const fetchUserBroadcasts = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user broadcasts:', error);
        return [];
    }

    return data.map(item => item.need_id);
};

/**
 * Fetch the full need objects broadcast by a user (for profile tab).
 * @param {string} userId
 */
export const fetchBroadcastedNeeds = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            created_at,
            need_id,
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching broadcasted needs:', error);
        return [];
    }

    return data.map(b => b.needs).filter(Boolean);
};

/**
 * Fetch broadcast counts for multiple needs.
 * Returns an object mapping needId -> count
 * @param {string[]} needIds
 */
export const fetchBroadcastCounts = async (needIds) => {
    if (!needIds?.length) return {};

    const { data, error } = await supabase
        .from('broadcasts')
        .select('need_id')
        .in('need_id', needIds);

    if (error) {
        console.error('Error fetching broadcast counts:', error);
        return {};
    }

    const counts = {};
    data.forEach(item => {
        counts[item.need_id] = (counts[item.need_id] || 0) + 1;
    });

    return counts;
};

import { supabase } from './supabase';

/**
 * Toggle interest signal for a need.
 */
export const toggleInterest = async (userId, needId, currentlyInterested) => {
    if (!userId || !needId) return;

    if (currentlyInterested) {
        const { error } = await supabase
            .from('need_interests')
            .delete()
            .eq('user_id', userId)
            .eq('need_id', needId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('need_interests')
            .insert([{ user_id: userId, need_id: needId }]);
        if (error) throw error;
    }
};

/**
 * Fetch all need IDs the user has expressed interest in.
 */
export const fetchUserInterests = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('need_interests')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user interests:', error);
        return [];
    }

    return data.map(r => r.need_id);
};

/**
 * Get total interest count for a need.
 */
export const getInterestCount = async (needId) => {
    if (!needId) return 0;

    const { count, error } = await supabase
        .from('need_interests')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

    if (error) {
        console.error('Error fetching interest count:', error);
        return 0;
    }

    return count || 0;
};

/**
 * Get the list of users who expressed interest in a need (for the need owner).
 */
export const getInterestedUsers = async (needId) => {
    if (!needId) return [];

    const { data, error } = await supabase
        .from('need_interests')
        .select(`
            user_id,
            created_at,
            profiles:user_id (
                display_name,
                username,
                avatar_url
            )
        `)
        .eq('need_id', needId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching interested users:', error);
        return [];
    }

    return data;
};

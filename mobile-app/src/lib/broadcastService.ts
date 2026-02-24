import { supabase } from './supabase';

/** Toggle a broadcast for a need or endorsement. */
export const toggleBroadcast = async (userId: string, targetId: string, currentlyBroadcasted: boolean, type: 'need' | 'endorsement' = 'need') => {
    if (!userId || !targetId) return;

    const column = type === 'need' ? 'need_id' : 'endorsement_id';

    if (currentlyBroadcasted) {
        const { error } = await supabase
            .from('broadcasts')
            .delete()
            .eq('user_id', userId)
            .eq(column, targetId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('broadcasts')
            .insert([{ user_id: userId, [column]: targetId }]);
        if (error) throw error;
    }
};

/** Fetch all need IDs broadcast by a user. */
export const fetchUserBroadcasts = async (userId: string): Promise<string[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user broadcasts:', error);
        return [];
    }

    return data.map((item: any) => item.need_id);
};

/** Get the broadcast count for a single need. */
export const getBroadcastCount = async (needId: string): Promise<number> => {
    if (!needId) return 0;
    const { count, error } = await supabase
        .from('broadcasts')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

    if (error) {
        console.error('Error fetching broadcast count:', error);
        return 0;
    }
    return count || 0;
};

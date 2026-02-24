import { supabase } from './supabase';

/** Toggle a like for a need. */
export const toggleLike = async (userId: string, needId: string, currentlyLiked: boolean) => {
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

/** Fetch all need IDs liked by a user. */
export const fetchUserLikes = async (userId: string): Promise<string[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('likes')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user likes:', error);
        return [];
    }

    return data.map((item: any) => item.need_id);
};

/** Get the total like count for a need. */
export const getLikeCount = async (needId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

    if (error) {
        console.error('Error fetching like count:', error);
        return 0;
    }
    return count || 0;
};

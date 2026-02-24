import { supabase } from './supabase';

/** Insert a new reply onto a need. */
export const createReply = async (
    needId: string,
    userId: string,
    content: string,
    isPrivate: boolean = false,
    parentId: string | null = null
) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            need_id: needId,
            user_id: userId,
            content,
            is_private: isPrivate,
            parent_id: parentId,
        }])
        .select('*, profiles(display_name, avatar_url, username)')
        .single();

    if (error) throw error;

    // Fire notifications asynchronously (don't block UI)
    try {
        const { data: needData } = await supabase
            .from('needs')
            .select('user_id, title')
            .eq('id', needId)
            .single();

        if (needData && needData.user_id !== userId) {
            await supabase.from('notifications').insert([{
                recipient_id: needData.user_id,
                type: 'reply',
                actor_id: userId,
                message: `replied to your need: ${needData.title}`,
                need_id: needId,
            }]);
        }
    } catch (notifyErr) {
        console.error('Failed to send reply notification:', notifyErr);
    }

    return data;
};

/** Fetch total reply count for a specific need. */
export const getReplyCount = async (needId: string): Promise<number> => {
    if (!needId) return 0;
    const { count, error } = await supabase
        .from('replies')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

    if (error) {
        console.error('Error fetching reply count:', error);
        return 0;
    }
    return count || 0;
};

/** Fetch all replies for a specific need, ordered by creation. */
export const fetchRepliesForNeed = async (needId: string): Promise<any[]> => {
    if (!needId) return [];
    const { data, error } = await supabase
        .from('replies')
        .select('*, profiles(display_name, avatar_url, username, bio)')
        .eq('need_id', needId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching replies:', error);
        return [];
    }
    return data;
};

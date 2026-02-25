import { supabase } from './supabase';
import { createNotification } from './notificationService';

/** Fetch all replies for a specific need or endorsement. */
export const fetchRepliesForNeed = async (needId: string | null, endorsementId: string | null = null): Promise<any[]> => {
    if (!needId && !endorsementId) return [];

    let query = supabase
        .from('replies')
        .select('*, profiles(display_name, avatar_url, username)')
        .neq('status', 'archived')
        .order('created_at', { ascending: true });

    if (endorsementId) {
        query = query.eq('endorsement_id', endorsementId);
    } else {
        query = query.eq('need_id', needId).is('endorsement_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/** Fetch all replies made by a specific user (for their Dashboard/Profile). */
export const fetchRepliesByUser = async (userId: string): Promise<any[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('replies')
        .select('*, needs(title), profiles(display_name, avatar_url, username)')
        .eq('user_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/** Insert a new reply onto a need or as a nested reply. */
export const createReply = async (
    needId: string,
    userId: string,
    content: string,
    isPrivate: boolean = false,
    parentId: string | null = null,
    endorsementId: string | null = null
) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            need_id: needId,
            user_id: userId,
            content,
            is_private: isPrivate,
            parent_id: parentId,
            endorsement_id: endorsementId
        }])
        .select('*, profiles(display_name, avatar_url, username)')
        .single();

    if (error) throw error;

    // Fire notifications asynchronously (don't block UI)
    try {
        // 1. Notify the Author of the Need
        const { data: needData } = await supabase
            .from('needs')
            .select('user_id, title')
            .eq('id', needId)
            .single();

        if (needData && needData.user_id !== userId) {
            await createNotification(
                needData.user_id,
                'reply',
                userId,
                `replied to your need: ${needData.title}`,
                needId
            );
        }

        // 2. If it's a nested reply, notify the Author of the parent comment
        if (parentId) {
            const { data: parentData } = await supabase
                .from('replies')
                .select('user_id')
                .eq('id', parentId)
                .single();

            if (parentData && parentData.user_id !== userId && parentData.user_id !== needData?.user_id) {
                await createNotification(
                    parentData.user_id,
                    'reply',
                    userId,
                    `replied to your comment in: ${needData?.title || 'a thread'}`,
                    needId
                );
            }
        }
    } catch (notifyErr) {
        console.error('Failed to send reply notifications:', notifyErr);
    }

    return data;
};

/** Fetch total reply count for a specific need or endorsement. */
export const getReplyCount = async (needId: string | null, endorsementId: string | null = null): Promise<number> => {
    if (!needId && !endorsementId) return 0;

    let query = supabase
        .from('replies')
        .select('*', { count: 'exact', head: true });

    if (endorsementId) {
        query = query.eq('endorsement_id', endorsementId);
    } else {
        query = query.eq('need_id', needId).is('endorsement_id', null);
    }

    const { count, error } = await query;

    if (error) {
        console.error('Error fetching reply count:', error);
        return 0;
    }
    return count || 0;
};

/** Update a reply's status (e.g. for archival). */
export const updateReplyStatus = async (replyId: string, status: string) => {
    const { error } = await supabase
        .from('replies')
        .update({ status })
        .eq('id', replyId);
    if (error) throw error;
};

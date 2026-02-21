import { supabase } from './supabase';
import { createNotification } from './notificationService';
import { timeAgo } from './needsService';

/**
 * Fetch all replies for a specific need, ordered by oldest to newest to form a readable thread.
 */
export const fetchRepliesForNeed = async (needId) => {
    const { data, error } = await supabase
        .from('replies')
        .select('*, profiles(display_name, avatar_url, username)')
        .eq('need_id', needId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Fetch all replies made by a specific user (for their Dashboard).
 * Also joins the `needs` table to get the title of the need they replied to.
 */
export const fetchRepliesByUser = async (userId) => {
    const { data, error } = await supabase
        .from('replies')
        .select('*, needs(title), profiles(display_name, avatar_url, username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Insert a new reply onto a need or as a nested reply.
 */
export const createReply = async (needId, userId, content, isPrivate = false, parentId = null) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            need_id: needId,
            user_id: userId,
            content: content,
            is_private: isPrivate,
            parent_id: parentId
        }])
        .select('*, profiles(display_name, avatar_url, username)')
        .single();

    if (error) throw error;

    // Try to send notifications asynchronously (don't block the UI)
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
        console.error("Failed to send reply notifications:", notifyErr);
    }

    return data;
};

/**
 * Format timestamp nicely.
 */
export const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

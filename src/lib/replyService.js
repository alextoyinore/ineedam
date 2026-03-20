import { supabase } from './supabase';
import { createNotification } from './notificationService';
import { handleMentions } from './mentionService';
import { timeAgo } from './needsService';

/**
 * Fetch all replies for a specific need or endorsement.
 */
export const fetchRepliesForNeed = async (needId, endorsementId = null) => {
    let query = supabase
        .from('replies')
        .select('*, profiles(display_name, avatar_url, username, last_seen_at, kyc_status, location, bio)')
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

/**
 * Fetch all replies made by a specific user (for their Dashboard).
 * Also joins the `needs` table to get the title of the need they replied to.
 */
export const fetchRepliesByUser = async (userId) => {
    const { data, error } = await supabase
        .from('replies')
        .select('*, needs(title), profiles(display_name, avatar_url, username, last_seen_at, kyc_status, location, bio)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Insert a new reply onto a need or endorsement.
 */
export const createReply = async (needId, userId, content, isPrivate = false, parentId = null, endorsementId = null, fileUrl = null, fileType = null) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            need_id: needId,
            user_id: userId,
            content: content,
            is_private: isPrivate,
            parent_id: parentId,
            endorsement_id: endorsementId,
            file_url: fileUrl,
            file_type: fileType
        }])
        .select('*, profiles(display_name, avatar_url, username, last_seen_at, kyc_status, location, bio)')
        .single();

    if (error) throw error;

    // Try to send notifications asynchronously (don't block the UI)
    try {
        // 1. Handle Mentions
        await handleMentions(content, userId, 'mention', needId, 'mentioned you in a reply');

        // 2. Notify the Author of the Need
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

        // 3. If it's a nested reply, notify the Author of the parent comment
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
/**
 * Fetch total reply count for a specific need
 */
export const getReplyCount = async (needId, endorsementId = null) => {
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
export const updateReplyStatus = async (replyId, status) => {
    const { error } = await supabase
        .from('replies')
        .update({ status })
        .eq('id', replyId);
    if (error) throw error;
};

/**
 * Get the first reply to a need from someone other than the need's author.
 * Returns the created_at timestamp string, or null if no replies yet.
 */
export const getFirstReplyTime = async (needId, authorId) => {
    if (!needId) return null;

    const query = supabase
        .from('replies')
        .select('created_at, need_id, user_id')
        .eq('need_id', needId)
        .is('endorsement_id', null)
        .eq('is_private', false)
        .order('created_at', { ascending: true })
        .limit(1);

    // Exclude the need owner's own replies if we have their ID
    if (authorId) {
        query.neq('user_id', authorId);
    }

    const { data, error } = await query;

    if (error || !data?.length) return null;
    return data[0].created_at;
};

/**
 * Format time-to-first-response as a human-readable string.
 * e.g. "First response in 5m", "First response in 2h", "First response in 3d"
 */
export const formatResponseTime = (needCreatedAt, firstReplyAt) => {
    if (!needCreatedAt || !firstReplyAt) return null;
    const diff = new Date(firstReplyAt).getTime() - new Date(needCreatedAt).getTime();
    if (diff < 0) return null;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `First response in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `First response in ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `First response in ${days}d`;
};


import { supabase } from './supabase';

/**
 * Fetch all bookmark records for the current user.
 * Returns objects with { id, type } to differentiate needs, endorsements, and replies.
 */
export const fetchBookmarks = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select('need_id, endorsement_id, reply_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }

    return data.map(b => {
        if (b.need_id) return { id: b.need_id, type: 'need' };
        if (b.endorsement_id) return { id: b.endorsement_id, type: 'endorsement' };
        if (b.reply_id) return { id: b.reply_id, type: 'reply' };
        return null;
    }).filter(Boolean);
};

/**
 * Fetch the full objects for all bookmarks of a user (needs, endorsements, and messages).
 */
export const fetchBookmarkedItems = async (userId) => {
    if (!userId) return [];

    // 1. Fetch from standard bookmarks table (needs, endorsements)
    const { data: standardData, error: standardError } = await supabase
        .from('bookmarks')
        .select(`
            need_id,
            endorsement_id,
            reply_id,
            created_at,
            needs (
                *,
                profiles!needs_user_id_fkey (
                    display_name,
                    username,
                    avatar_url,
                    banner_url,
                    bio,
                    last_seen_at,
                    location
                )
            ),
            endorsements (
                id, message, created_at,
                endorser_id,
                endorsed_id,
                need_id,
                endorser:profiles!endorsements_endorser_id_fkey (
                    id, display_name, username, avatar_url, bio, last_seen_at, location
                ),
                endorsed:profiles!endorsements_endorsed_id_fkey (
                    id, display_name, username, avatar_url, bio, last_seen_at, location
                ),
                needs (
                    id, title, description, category, status
                )
            ),
            replies (
                *,
                profiles(display_name, avatar_url, username, bio, last_seen_at, location),
                needs(id, title)
            )
        `)
        .eq('user_id', userId);

    if (standardError) {
        console.error("Error fetching standard bookmarks:", standardError);
    }

    // 2. Fetch from message_bookmarks table
    const { data: messageData, error: messageError } = await supabase
        .from('message_bookmarks')
        .select(`
            message_id,
            created_at,
            messages (
                id,
                text,
                file_url,
                file_type,
                created_at,
                thread_id,
                sender:profiles!messages_sender_id_fkey (
                    id, display_name, username, avatar_url, last_seen_at, bio, location
                )
            )
        `)
        .eq('user_id', userId);

    if (messageError) {
        console.error("Error fetching message bookmarks:", messageError);
    }

    // Flatten and tag standard bookmarks
    const standardItems = (standardData || []).map(b => {
        if (b.need_id && b.needs) {
            return { ...b.needs, type: 'need', bookmark_created_at: b.created_at };
        }
        if (b.endorsement_id && b.endorsements) {
            return { ...b.endorsements, type: 'endorsement', bookmark_created_at: b.created_at };
        }
        if (b.reply_id && b.replies) {
            return { ...b.replies, type: 'reply', bookmark_created_at: b.created_at };
        }
        return null;
    }).filter(Boolean);

    // Flatten and tag message bookmarks
    const messageItems = (messageData || []).map(b => {
        if (b.message_id && b.messages) {
            return { ...b.messages, type: 'message', bookmark_created_at: b.created_at };
        }
        return null;
    }).filter(Boolean);

    // Combine and sort by bookmark creation time (newest first)
    return [...standardItems, ...messageItems].sort((a, b) =>
        new Date(b.bookmark_created_at) - new Date(a.bookmark_created_at)
    );
};

/**
 * Toggle a bookmark for a specific item and user.
 * @param {string} userId
 * @param {string} targetId - The ID of the need or endorsement
 * @param {boolean} isCurrentlyBookmarked
 * @param {string} type - 'need' or 'endorsement'
 */
export const toggleBookmarkInDb = async (userId, targetId, isCurrentlyBookmarked, type = 'need') => {
    if (!userId) return false;

    let column = 'need_id';
    if (type === 'endorsement') column = 'endorsement_id';
    if (type === 'broadcast') column = 'broadcast_id';
    if (type === 'reply') column = 'reply_id';

    if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq(column, targetId);

        if (error) {
            console.error(`Error removing ${type} bookmark:`, error);
            throw error;
        }
        return false;
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('bookmarks')
            .insert([{ user_id: userId, [column]: targetId }]);

        if (error) {
            console.error(`Error adding ${type} bookmark:`, error);
            throw error;
        }
        return true;
    }
};

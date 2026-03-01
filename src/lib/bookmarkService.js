import { supabase } from './supabase';

/**
 * Fetch all bookmark records for the current user.
 * Returns objects with { id, type } to differentiate needs from endorsements.
 */
export const fetchBookmarks = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select('need_id, endorsement_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }

    return data.map(b => {
        if (b.need_id) return { id: b.need_id, type: 'need' };
        if (b.endorsement_id) return { id: b.endorsement_id, type: 'endorsement' };
        return null;
    }).filter(Boolean);
};

/**
 * Fetch the full objects for all bookmarks of a user (needs or endorsements).
 */
export const fetchBookmarkedItems = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select(`
            need_id,
            endorsement_id,
            created_at,
            needs (
                *,
                profiles!needs_user_id_fkey (
                    display_name,
                    username,
                    avatar_url,
                    banner_url,
                    bio
                )
            ),
            endorsements (
                id, message, created_at,
                endorser_id,
                endorsed_id,
                need_id,
                endorser:profiles!endorsements_endorser_id_fkey (
                    id, display_name, username, avatar_url, bio
                ),
                endorsed:profiles!endorsements_endorsed_id_fkey (
                    id, display_name, username, avatar_url, bio
                ),
                needs (
                    id, title, description, category, status
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching full bookmarked items:", error);
        return [];
    }

    // Flatten and tag with type — check the id column, not the joined object
    // (the joined object can be null even if the FK is set, e.g. due to RLS)
    return data.map(b => {
        if (b.need_id && b.needs) {
            return { ...b.needs, type: 'need', bookmark_created_at: b.created_at };
        }
        if (b.need_id && !b.needs) {
            // Joined need is null (possibly deleted or RLS-hidden) — skip it
            return null;
        }
        if (b.endorsement_id && b.endorsements) {
            return { ...b.endorsements, type: 'endorsement', bookmark_created_at: b.created_at };
        }
        return null;
    }).filter(Boolean);
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

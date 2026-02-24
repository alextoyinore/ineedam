import { supabase } from './supabase';

/**
 * Fetch all bookmark records for the current user.
 * Returns objects with { id, type } to differentiate needs from endorsements.
 */
export const fetchBookmarks = async (userId: any) => {
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
export const fetchBookmarkedItems = async (userId: any) => {
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

    // Flatten and tag with type — shape needs through shapeNeed() so NeedCard gets
    // the flat fields it expects (author, authorAvatar, budget, postedAt, etc.)
    const { shapeNeed } = require('./needsService');

    return data.map((b: any) => {
        if (b.needs) {
            return {
                ...shapeNeed(b.needs),
                type: 'need',
                bookmark_created_at: b.created_at,
            };
        }
        if (b.endorsements) {
            const e = b.endorsements;
            return {
                ...e,
                type: 'endorsement',
                author: e.endorser?.display_name || 'Unknown',
                authorUsername: e.endorser?.username || null,
                authorAvatar: e.endorser?.avatar_url || null,
                authorId: e.endorser?.id || e.endorser_id,
                postedAt: e.created_at,
                bookmark_created_at: b.created_at,
            };
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
export const toggleBookmarkInDb = async (userId: any, targetId: any, isCurrentlyBookmarked: any, type: any = 'need') => {
    if (!userId) return false;

    const column = type === 'need' ? 'need_id' : 'endorsement_id';

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

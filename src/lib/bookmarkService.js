import { supabase } from './supabase';

/**
 * Fetch all bookmark IDs for the current user.
 */
export const fetchBookmarks = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select('need_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }

    return data.map(b => b.need_id);
};

/**
 * Fetch the full need objects for all bookmarks of a user.
 */
export const fetchFullBookmarkedNeeds = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select(`
            need_id,
            needs (
                *,
                profiles!needs_user_id_fkey (
                    display_name,
                    username,
                    avatar_url,
                    banner_url,
                    bio
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching full bookmarked needs:", error);
        return [];
    }

    // Flatten the result to return an array of need objects
    return data.map(b => b.needs).filter(n => n !== null);
};

/**
 * Toggle a bookmark for a specific need and user.
 */
export const toggleBookmarkInDb = async (userId, needId, isCurrentlyBookmarked) => {
    if (!userId) return false;

    if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq('need_id', needId);

        if (error) {
            console.error("Error removing bookmark:", error);
            throw error;
        }
        return false;
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('bookmarks')
            .insert([{ user_id: userId, need_id: needId }]);

        if (error) {
            console.error("Error adding bookmark:", error);
            throw error;
        }
        return true;
    }
};

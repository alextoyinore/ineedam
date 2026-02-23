import { supabase } from './supabase';

/**
 * Block a user.
 */
export const blockUser = async (blockerId, blockedId) => {
    const { data, error } = await supabase
        .from('user_blocks')
        .insert([{ blocker_id: blockerId, blocked_id: blockedId }]);

    if (error) {
        if (error.code === '23505') return null; // Already blocked
        throw error;
    }
    return data;
};

/**
 * Unblock a user.
 */
export const unblockUser = async (blockerId, blockedId) => {
    const { data, error } = await supabase
        .from('user_blocks')
        .delete()
        .match({ blocker_id: blockerId, blocked_id: blockedId });

    if (error) throw error;
    return data;
};

/**
 * Get the list of profiles a specific user has blocked.
 */
export const getBlockedUsers = async (userId) => {
    const { data, error } = await supabase
        .from('user_blocks')
        .select(`
            blocked_id,
            profiles!user_blocks_blocked_id_fkey (
                id, display_name, username, avatar_url, bio
            )
        `)
        .eq('blocker_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching blocked users:", error);
        return [];
    }
    return data.map(row => row.profiles).filter(Boolean);
};

/**
 * Report a user.
 */
export const reportUser = async (reporterId, reportedId, reason, notes = '') => {
    const { data, error } = await supabase
        .from('user_reports')
        .insert([{
            reporter_id: reporterId,
            reported_id: reportedId,
            reason,
            notes
        }]);

    if (error) throw error;
    return data;
};

/**
 * Check if the active user has blocked the other user or if the other user has blocked the active user.
 * Returns { hasBlocked: boolean, isBlockedBy: boolean }
 */
export const checkBlockStatus = async (userId, otherUserId) => {
    if (!userId || !otherUserId) return { hasBlocked: false, isBlockedBy: false };

    // We fetch blocks where the current pair is involved
    const { data, error } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`);

    if (error) {
        console.error("Error checking block status:", error);
        return { hasBlocked: false, isBlockedBy: false };
    }

    let hasBlocked = false;
    let isBlockedBy = false;

    data.forEach(block => {
        if (block.blocker_id === userId && block.blocked_id === otherUserId) {
            hasBlocked = true;
        }
        if (block.blocker_id === otherUserId && block.blocked_id === userId) {
            isBlockedBy = true;
        }
    });

    return { hasBlocked, isBlockedBy };
};

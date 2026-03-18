import { supabase } from './supabase';

/**
 * Toggle a like for a need or reply.
 * @param {string} userId 
 * @param {string|null} needId 
 * @param {boolean} currentlyLiked 
 * @param {string|null} replyId
 */
export const toggleLike = async (userId, needId, currentlyLiked, replyId = null) => {
    if (!userId || (!needId && !replyId)) return;

    if (currentlyLiked) {
        let query = supabase
            .from('likes')
            .delete()
            .eq('user_id', userId);
        
        if (replyId) {
            query = query.eq('reply_id', replyId);
        } else {
            query = query.eq('need_id', needId);
        }

        const { error } = await query;
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('likes')
            .insert([{ 
                user_id: userId, 
                need_id: needId,
                reply_id: replyId
            }]);
        if (error) throw error;
    }
};

/**
 * Fetch all need and reply IDs liked by a user.
 * @param {string} userId 
 */
export const fetchUserLikes = async (userId) => {
    if (!userId) return { needIds: [], replyIds: [] };

    const { data, error } = await supabase
        .from('likes')
        .select('need_id, reply_id')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user likes:", error);
        return { needIds: [], replyIds: [] };
    }

    return {
        needIds: data.map(item => item.need_id).filter(Boolean),
        replyIds: data.map(item => item.reply_id).filter(Boolean)
    };
};

/**
 * Get the total like count for a need or reply.
 * @param {string|null} needId 
 * @param {string|null} replyId
 */
export const getLikeCount = async (needId, replyId = null) => {
    if (!needId && !replyId) return 0;
    
    let query = supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });
    
    if (replyId) {
        query = query.eq('reply_id', replyId);
    } else {
        query = query.eq('need_id', needId);
    }

    const { count, error } = await query;

    if (error) {
        console.error("Error fetching like count:", error);
        return 0;
    }

    return count;
};

/**
 * Fetch like counts for multiple needs.
 * returns an object mapping needId -> count
 */
export const fetchMultipleLikeCounts = async (needIds) => {
    if (!needIds?.length) return {};

    const { data, error } = await supabase
        .from('likes')
        .select('need_id');

    if (error) {
        console.error("Error fetching multiple like counts:", error);
        return {};
    }

    const counts = {};
    data.forEach(item => {
        counts[item.need_id] = (counts[item.need_id] || 0) + 1;
    });

    return counts;
};

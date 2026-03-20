import { supabase } from './supabase';
import { shapeNeed } from './needsService';

/**
 * Toggle a broadcast for a need.
 * @param {string} userId
 * @param {string} needId
 * @param {boolean} currentlyBroadcasted
 */
export const toggleBroadcast = async (userId, targetId, currentlyBroadcasted, type = 'need') => {
    if (!userId || !targetId) return;

    const column = type === 'need' ? 'need_id' : (type === 'reply' ? 'reply_id' : 'endorsement_id');

    if (currentlyBroadcasted) {
        const { error } = await supabase
            .from('broadcasts')
            .delete()
            .eq('user_id', userId)
            .eq(column, targetId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('broadcasts')
            .insert([{ user_id: userId, [column]: targetId }]);
        if (error) throw error;
    }
};

/**
 * Fetch all need IDs broadcast by a user.
 * @param {string} userId
 */
export const fetchUserBroadcasts = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select('need_id, endorsement_id, reply_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user broadcasts:', error);
        return [];
    }

    return data.map(item => item.need_id || item.endorsement_id || item.reply_id).filter(Boolean);
};

/**
 * Fetch the full need objects broadcast by a user (for profile tab).
 * @param {string} userId
 */
export const fetchBroadcastedNeeds = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            id, created_at,
            profiles (id, display_name, username, avatar_url, last_seen_at, bio, location),
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url, bio, last_seen_at, location
                )
            ),
            endorsements (
                id, message, created_at,
                endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at, location),
                endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at, location),
                needs:needs(id, title, category, budget_min, status)
            ),
            replies (
                id, content, created_at, need_id,
                profiles:profiles(id, display_name, username, avatar_url, last_seen_at, bio, location),
                needs:needs(id, title)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching broadcasted needs:', error);
        return [];
    }

    return data.map(b => {
        if (b.needs) {
            return {
                ...shapeNeed(b.needs),
                type: 'broadcast',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        } else if (b.endorsements) {
            return {
                ...b.endorsements,
                type: 'broadcast_endorsement',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        } else if (b.replies) {
            return {
                ...b.replies,
                type: 'broadcast_reply',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        }
        return null;
    }).filter(b => b && b.broadcast_id);
};

/**
 * Fetch all recent broadcasts globally.
 * @param {number} from
 * @param {number} to
 */
export const fetchAllBroadcasts = async (from = 0, to = 9) => {
    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            id, created_at,
            profiles (id, display_name, username, avatar_url, last_seen_at, bio, location),
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url, bio, last_seen_at, location
                )
            ),
            endorsements (
                id, message, created_at,
                endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at, location),
                endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at, location),
                needs:needs(id, title, category, budget_min, status)
            ),
            replies (
                id, content, created_at, need_id,
                profiles:profiles(id, display_name, username, avatar_url, last_seen_at, bio, location),
                needs:needs(id, title)
            )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching global broadcasts:', error);
        return [];
    }

    return data.map(b => {
        if (b.needs) {
            if (b.needs.status === 'archived') return null;
            return {
                ...shapeNeed(b.needs),
                type: 'broadcast',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        } else if (b.endorsements) {
            return {
                ...b.endorsements,
                category: b.endorsements.needs?.category,
                budgetMin: b.endorsements.needs?.budget_min,
                type: 'broadcast_endorsement',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        } else if (b.replies) {
            return {
                ...b.replies,
                type: 'broadcast_reply',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        }
        return null;
    }).filter(b => b !== null);
};

/**
 * Fetch broadcast counts for multiple needs.
 * Returns an object mapping needId -> count
 * @param {string[]} needIds
 */
export const fetchBroadcastCounts = async (ids, type = 'need') => {
    if (!ids?.length) return {};

    const column = type === 'need' ? 'need_id' : (type === 'reply' ? 'reply_id' : 'endorsement_id');

    const { data, error } = await supabase
        .from('broadcasts')
        .select(column)
        .in(column, ids);

    if (error) {
        console.error(`Error fetching broadcast counts for ${type}:`, error);
        return {};
    }

    const counts = {};
    data.forEach(item => {
        const id = item[column];
        counts[id] = (counts[id] || 0) + 1;
    });

    return counts;
};
/**
 * Fetch broadcast count for a single need
 */
export const getBroadcastCount = async (targetId, type = 'need') => {
    if (!targetId) return 0;
    const column = type === 'need' ? 'need_id' : (type === 'reply' ? 'reply_id' : 'endorsement_id');
    const { count, error } = await supabase
        .from('broadcasts')
        .select('*', { count: 'exact', head: true })
        .eq(column, targetId);

    if (error) {
        console.error(`Error fetching single ${type} broadcast count:`, error);
        return 0;
    }
    return count || 0;
};

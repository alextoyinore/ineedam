import { supabase } from './supabase';
import { shapeNeed } from './needsService';

/** Toggle a broadcast for a need or endorsement. */
export const toggleBroadcast = async (userId: string, targetId: string, currentlyBroadcasted: boolean, type: 'need' | 'endorsement' = 'need') => {
    if (!userId || !targetId) return;

    const column = type === 'need' ? 'need_id' : 'endorsement_id';

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

/** Fetch all IDs (need or endorsement) broadcast by a user. */
export const fetchUserBroadcasts = async (userId: string): Promise<string[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select('need_id, endorsement_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user broadcasts:', error);
        return [];
    }

    return data.map((item: any) => item.need_id || item.endorsement_id).filter(Boolean);
};

/** Fetch the full need objects broadcast by a user (for profile tab). */
export const fetchBroadcastedNeeds = async (userId: string): Promise<any[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            id, created_at,
            profiles (id, display_name, username, avatar_url),
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url
                )
            ),
            endorsements (
                id, message, created_at,
                endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio),
                endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio),
                needs:needs(id, title, category, budget_min, status)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching broadcasted needs:', error);
        return [];
    }

    return (data || []).map((b: any) => {
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
        }
        return null;
    }).filter((b: any) => b && b.broadcast_id);
};

/** Fetch all recent broadcasts globally. */
export const fetchAllBroadcasts = async (from = 0, to = 9): Promise<any[]> => {
    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            id, created_at,
            profiles (id, display_name, username, avatar_url),
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url
                )
            ),
            endorsements (
                id, message, created_at,
                endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio),
                endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio),
                needs:needs(id, title, category, budget_min, status)
            )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching global broadcasts:', error);
        return [];
    }

    return (data || []).map((b: any) => {
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
            if (b.endorsements.needs?.status === 'archived') return null;
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
        }
        return null;
    }).filter((b: any) => b !== null);
};

/** Get the broadcast count for a single item (need or endorsement). */
export const getBroadcastCount = async (targetId: string, type: 'need' | 'endorsement' = 'need'): Promise<number> => {
    if (!targetId) return 0;
    const column = type === 'need' ? 'need_id' : 'endorsement_id';
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

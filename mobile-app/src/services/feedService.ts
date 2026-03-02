import { supabase } from '../lib/supabase';
import { shapeNeed, ShapedNeed } from './needsService';
import { fetchBroadcastedNeeds } from './broadcastService';
import { fetchEndorsementsForUser } from './endorsementService';

export const fetchAllEndorsements = async (from = 0, to = 9) => {
    const { data, error } = await supabase
        .from('endorsements')
        .select(`
            id, message, created_at,
            endorser_id,
            endorsed_id,
            need_id,
            endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio),
            endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio),
            needs(id, title, category, budget_min, status)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching global endorsements:', error);
        return [];
    }

    return (data || [])
        .filter(e => {
            const need = Array.isArray(e.needs) ? e.needs[0] : e.needs;
            return need && need.status !== 'archived';
        })
        .map(e => ({
            ...e,
            type: 'endorsement',
            created_at: e.created_at
        }));
};

export const fetchMixedFeed = async (from = 0, to = 9) => {
    const [{ data: needsData, error: needsError }, endorsements] = await Promise.all([
        supabase
            .from('needs')
            .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .range(from, to),
        fetchAllEndorsements(from, to)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    // Merge and sort
    const mixed = [...shapedNeeds, ...endorsements].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};

export const fetchFollowingFeed = async (userId: string, from = 0, to = 9) => {
    // 1. Get IDs of people the user follows
    const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (followError) throw followError;
    const followingIds = (followData || []).map(f => f.following_id);

    if (followingIds.length === 0) return [];

    // 2. Fetch needs from followed users
    const { data: needsData, error: needsError } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .in('user_id', followingIds)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (needsError) throw needsError;

    return (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));
};

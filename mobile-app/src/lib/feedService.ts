import { supabase } from './supabase';
import { shapeNeed } from './needsService';
import { timeAgo } from './needsService';
import { fetchAllBroadcasts } from './broadcastService';

/**
 * Fetch all endorsements globally, shaping them so they match Need items structure.
 */
export const fetchAllEndorsements = async (from: any = 0, to: any = 9, followingIds: string[] | null = null) => {
    let query = supabase
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

    if (followingIds && followingIds.length > 0) {
        query = query.or(`endorser_id.in.(${followingIds.join(',')}),endorsed_id.in.(${followingIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching endorsements:', error);
        return [];
    }

    return (data || [])
        .filter((e: any) => e.needs && e.needs.status !== 'archived')
        .map((e: any) => ({
            ...e,
            type: 'endorsement',
            postedAt: timeAgo(e.created_at)
        }));
};

/**
 * Fetch and merge needs, endorsements, and broadcasts from the database together.
 */
export const fetchMixedFeed = async (from: any = 0, to: any = 5, feedType: 'global' | 'following' = 'global', currentUserId: string | null = null) => {
    let followingIds: string[] = [];

    if (feedType === 'following' && currentUserId) {
        const { data: follows, error: followsError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId);

        if (!followsError && follows) {
            followingIds = follows.map((f: any) => f.following_id);
        }
    }

    let needsQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (feedType === 'following' && followingIds.length > 0) {
        needsQuery = needsQuery.in('user_id', followingIds);
    } else if (feedType === 'following' && followingIds.length === 0) {
        return [];
    }

    const [{ data: needsData, error: needsError }, endorsements, broadcasts] = await Promise.all([
        needsQuery,
        fetchAllEndorsements(from, to, feedType === 'following' ? followingIds : null),
        fetchAllBroadcasts(from, to) // Note: Broadcasts could also be filtered by following if needed
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map((need: any) => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    const mixed = [...shapedNeeds, ...endorsements, ...broadcasts].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};

/**
 * Filter mixed feed manually in JS for searching.
 */
export const searchMixedFeed = async ({ query, category, minBudget, maxBudget }: any, from = 0, to = 9) => {
    let supabaseQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)');

    if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
        supabaseQuery = supabaseQuery.eq('category', category);
    }
    if (minBudget) {
        supabaseQuery = supabaseQuery.gte('budget_min', parseFloat(minBudget));
    }
    if (maxBudget) {
        supabaseQuery = supabaseQuery.lte('budget_min', parseFloat(maxBudget));
    }

    const [{ data: needsData, error: needsError }, endorsements, broadcasts] = await Promise.all([
        supabaseQuery.neq('status', 'archived').order('created_at', { ascending: false }).range(from, to),
        fetchAllEndorsements(from, to),
        fetchAllBroadcasts(from, to)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map((need: any) => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    let filteredEndorsements = endorsements;
    let filteredBroadcasts = broadcasts;

    if (query) {
        const lowerQuery = query.toLowerCase();
        filteredEndorsements = filteredEndorsements.filter((e: any) =>
            (e.message && e.message.toLowerCase().includes(lowerQuery)) ||
            (e.endorsed?.display_name && e.endorsed.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.endorser?.display_name && e.endorser.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.needs?.title && e.needs.title.toLowerCase().includes(lowerQuery))
        );

        filteredBroadcasts = filteredBroadcasts.filter((b: any) =>
            (b.title && b.title.toLowerCase().includes(lowerQuery)) ||
            (b.description && b.description.toLowerCase().includes(lowerQuery)) ||
            (b.broadcasted_by?.display_name && b.broadcasted_by.display_name.toLowerCase().includes(lowerQuery))
        );
    }

    if (category) {
        filteredEndorsements = filteredEndorsements.filter((e: any) => e.needs?.category === category);
        filteredBroadcasts = filteredBroadcasts.filter((b: any) => b.category === category);
    }

    if (minBudget) {
        const min = parseFloat(minBudget);
        filteredEndorsements = filteredEndorsements.filter((e: any) => (e.needs?.budget_min || 0) >= min);
        filteredBroadcasts = filteredBroadcasts.filter((b: any) => (b.budgetMin || 0) >= min);
    }
    if (maxBudget) {
        const max = parseFloat(maxBudget);
        filteredEndorsements = filteredEndorsements.filter((e: any) => (e.needs?.budget_min || 0) <= max);
        filteredBroadcasts = filteredBroadcasts.filter((b: any) => (b.budgetMin || 0) <= max);
    }

    const mixed = [...shapedNeeds, ...filteredEndorsements, ...filteredBroadcasts].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};


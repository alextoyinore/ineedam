import { supabase } from './supabase';
import { shapeNeed } from './needsService';
import { timeAgo } from './needsService';
import { fetchAllBroadcasts } from './broadcastService';

/**
 * Fetch all endorsements globally, shaping them so they match Need items structure.
 * Increased default limits to reduce JS filtering drop off during MVP.
 */
export const fetchAllEndorsements = async (from = 0, to = 199) => {
    const { data, error } = await supabase
        .from('endorsements')
        .select(`
            id, message, created_at,
            endorser_id,
            endorsed_id,
            need_id,
            endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at),
            endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio, last_seen_at),
            needs(id, title, category, budget_min, status)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching global endorsements:', error);
        return [];
    }

    return (data || [])
        .map(e => ({
            ...e,
            type: 'endorsement',
            postedAt: timeAgo(e.created_at)
        }));
};

/**
 * Fetch and merge needs and endorsements from the database together.
 */
export const fetchMixedFeed = async (from = 0, to = 5) => {
    const [{ data: needsData, error: needsError }, endorsements, broadcasts] = await Promise.all([
        supabase
            .from('needs')
            .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio, last_seen_at)')
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .range(from, to),
        fetchAllEndorsements(0, 199),
        fetchAllBroadcasts(0, 199)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    // Merge and sort
    const mixed = [...shapedNeeds, ...endorsements, ...broadcasts].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};

/**
 * Filter mixed feed manually. We pull everything for simplicity,
 * then filter by query inside JS for endorsements since we only
 * have a basic search implemented.
 * Optimally, Supabase searching across multiple tables is better done using a DB View or RPC function.
 * For MVP, we fetch mixed data and filter.
 */
export const searchMixedFeed = async ({ query, category, minBudget, maxBudget }, from = 0, to = 9) => {
    let supabaseQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio, last_seen_at)');

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
        fetchAllEndorsements(0, 199),
        fetchAllBroadcasts(0, 199)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    // Filter endorsements and broadcasts manually in JS
    let filteredEndorsements = endorsements;
    let filteredBroadcasts = broadcasts;

    // Filter by query string
    if (query) {
        const lowerQuery = query.toLowerCase();
        filteredEndorsements = filteredEndorsements.filter(e =>
            (e.message && e.message.toLowerCase().includes(lowerQuery)) ||
            (e.endorsed?.display_name && e.endorsed.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.endorser?.display_name && e.endorser.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.needs?.title && e.needs.title.toLowerCase().includes(lowerQuery))
        );

        filteredBroadcasts = filteredBroadcasts.filter(b =>
            (b.title && b.title.toLowerCase().includes(lowerQuery)) ||
            (b.description && b.description.toLowerCase().includes(lowerQuery)) ||
            (b.broadcasted_by?.display_name && b.broadcasted_by.display_name.toLowerCase().includes(lowerQuery))
        );
    }

    // Filter by category
    if (category) {
        filteredEndorsements = filteredEndorsements.filter(e => e.needs?.category === category);
        filteredBroadcasts = filteredBroadcasts.filter(b => b.category === category);
    }

    // Filter by budget
    if (minBudget) {
        const min = parseFloat(minBudget);
        filteredEndorsements = filteredEndorsements.filter(e => e.needs?.budget_min >= min);
        filteredBroadcasts = filteredBroadcasts.filter(b => b.budgetMin >= min);
    }
    if (maxBudget) {
        const max = parseFloat(maxBudget);
        filteredEndorsements = filteredEndorsements.filter(e => e.needs?.budget_min <= max);
        filteredBroadcasts = filteredBroadcasts.filter(b => b.budgetMin <= max);
    }

    // Merge and sort
    const mixed = [...shapedNeeds, ...filteredEndorsements, ...filteredBroadcasts].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};

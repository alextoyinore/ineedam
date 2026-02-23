import { supabase } from './supabase';
import { shapeNeed } from './needsService';
import { timeAgo } from './needsService';

/**
 * Fetch all endorsements globally, shaping them so they match Need items structure.
 */
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
            needs(id, title)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching global endorsements:', error);
        return [];
    }

    return data.map(e => ({
        ...e,
        type: 'endorsement', // Discriminate the kind of feed card
        postedAt: timeAgo(e.created_at)
    }));
};

/**
 * Fetch and merge needs and endorsements from the database together.
 */
export const fetchMixedFeed = async (from = 0, to = 5) => {
    const [{ data: needsData, error: needsError }, endorsements] = await Promise.all([
        supabase
            .from('needs')
            .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
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

    const [{ data: needsData, error: needsError }, endorsements] = await Promise.all([
        supabaseQuery.order('created_at', { ascending: false }).range(from, to),
        fetchAllEndorsements(from, to)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    // Filter endorsements manually in JS
    let filteredEndorsements = endorsements;
    if (query) {
        const lowerQuery = query.toLowerCase();
        filteredEndorsements = endorsements.filter(e =>
            (e.message && e.message.toLowerCase().includes(lowerQuery)) ||
            (e.endorsed.display_name && e.endorsed.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.endorser.display_name && e.endorser.display_name.toLowerCase().includes(lowerQuery)) ||
            (e.needs.title && e.needs.title.toLowerCase().includes(lowerQuery))
        );
    }

    // If they strictly want category/budget, endorsements might not apply natively, but we can return them if it's just a query text match.
    // If they search specifically by category/budget, maybe drop endorsements. 
    if (category || minBudget || maxBudget) {
        filteredEndorsements = [];
    }

    // Merge and sort
    const mixed = [...shapedNeeds, ...filteredEndorsements].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};

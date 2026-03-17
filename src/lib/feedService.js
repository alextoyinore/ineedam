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
        fetchAllEndorsements(from, to),
        fetchAllBroadcasts(from, to)
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
 * Fetch a personalized feed for a specific user.
 * Prioritizes content from followed users and categories the user interacts with.
 */
export const fetchPersonalizedFeed = async (userId, from = 0, to = 19) => {
    if (!userId) return fetchMixedFeed(from, to);

    // 1. Fetch user context (follows and affinity) in parallel
    const [follows, replies] = await Promise.all([
        supabase.from('follows').select('following_id').eq('follower_id', userId),
        supabase.from('replies').select('needs!inner(category)').eq('user_id', userId).limit(100)
    ]);

    const followingIds = new Set((follows.data || []).map(f => f.following_id));
    const affinityCategories = new Set((replies.data || []).map(r => r.needs?.category).filter(Boolean));

    // 2. Fetch candidates (larger pool for better personalization)
    // Fetch last 100 of each to have enough variability
    const [{ data: needsData, error: needsError }, endorsements, broadcasts] = await Promise.all([
        supabase
            .from('needs')
            .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio, last_seen_at)')
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .limit(100),
        fetchAllEndorsements(0, 99),
        fetchAllBroadcasts(0, 99)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map(need => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    // 3. Scoring Heuristic
    // We boost by "time equivalents" (e.g., following someone makes them 48h "newer")
    const FOLLOW_BOOST_MS = 48 * 60 * 60 * 1000;
    const CATEGORY_BOOST_MS = 12 * 60 * 60 * 1000;

    const scoreItem = (item) => {
        const baseTime = new Date(item.created_at).getTime();
        let boost = 0;

        // Author affinity (Need/Broadcast author, or Endorser)
        const authorId = item.type === 'need' ? item.authorId : 
                        (item.type === 'endorsement' ? item.endorser?.id : item.broadcasted_by?.id);
        
        if (followingIds.has(authorId)) {
            boost += FOLLOW_BOOST_MS;
        }

        // Category affinity
        const category = item.type === 'need' ? item.category : 
                        (item.type === 'endorsement' ? item.needs?.category : item.category);
        
        if (affinityCategories.has(category)) {
            boost += CATEGORY_BOOST_MS;
        }

        return baseTime + boost;
    };

    // 4. Combine, Score, and Sort
    const allCandidates = [...shapedNeeds, ...endorsements, ...broadcasts];
    const scored = allCandidates.map(item => ({
        ...item,
        _relevanceScore: scoreItem(item)
    }));

    scored.sort((a, b) => b._relevanceScore - a._relevanceScore);

    // 5. Return requested range
    return scored.slice(from, to + 1);
};

/**
 * Filter mixed feed manually. We pull everything for simplicity,
 * then filter by query inside JS for endorsements since we only
 * have a basic search implemented.
 * Optimally, Supabase searching across multiple tables is better done using a DB View or RPC function.
 * For MVP, we fetch mixed data and filter.
 */
export const searchMixedFeed = async ({ query, category, minBudget, maxBudget, status, sortBy, timeframe, types, location, flexibility, budgetMode }, from = 0, to = 9) => {
    let supabaseQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio, last_seen_at)');

    if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category && category !== 'All') {
        supabaseQuery = supabaseQuery.eq('category', category);
    }
    if (minBudget) {
        supabaseQuery = supabaseQuery.gte('budget_min', parseFloat(minBudget));
    }
    if (maxBudget) {
        supabaseQuery = supabaseQuery.lte('budget_min', parseFloat(maxBudget));
    }
    if (status && status !== 'all') {
        supabaseQuery = supabaseQuery.eq('status', status);
    }
    if (location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }
    if (flexibility && flexibility !== 'all') {
        supabaseQuery = supabaseQuery.eq('flexibility', flexibility);
    }
    if (budgetMode && budgetMode !== 'all') {
        supabaseQuery = supabaseQuery.eq('budget_mode', budgetMode);
    }
    if (timeframe && timeframe !== 'all') {
        const now = new Date();
        let sinceDate;
        if (timeframe === 'today') sinceDate = new Date(now.setDate(now.getDate() - 1));
        else if (timeframe === 'week') sinceDate = new Date(now.setDate(now.getDate() - 7));
        else if (timeframe === 'month') sinceDate = new Date(now.setMonth(now.getMonth() - 1));
        
        if (sinceDate) {
            supabaseQuery = supabaseQuery.gte('created_at', sinceDate.toISOString());
        }
    }

    // Sorting
    if (sortBy === 'budget_high') {
        supabaseQuery = supabaseQuery.order('budget_min', { ascending: false, nullsFirst: false });
    } else if (sortBy === 'budget_low') {
        supabaseQuery = supabaseQuery.order('budget_min', { ascending: true, nullsFirst: false });
    } else {
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
    }

    const showNeeds = !types || types.includes('need');
    const showEndorsements = !types || types.includes('endorsement');
    const showBroadcasts = !types || types.includes('broadcast');

    const [{ data: needsData, error: needsError }, endorsements, broadcasts] = await Promise.all([
        showNeeds ? supabaseQuery.neq('status', 'archived').range(from, to) : Promise.resolve({ data: [], error: null }),
        showEndorsements ? fetchAllEndorsements(0, 199) : Promise.resolve([]),
        showBroadcasts ? fetchAllBroadcasts(0, 199) : Promise.resolve([])
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
    if (category && category !== 'All') {
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

    // Filter by timeframe
    if (timeframe && timeframe !== 'all') {
        const now = new Date();
        let sinceDate;
        if (timeframe === 'today') sinceDate = new Date(now.setDate(now.getDate() - 1));
        else if (timeframe === 'week') sinceDate = new Date(now.setDate(now.getDate() - 7));
        else if (timeframe === 'month') sinceDate = new Date(now.setMonth(now.getMonth() - 1));

        if (sinceDate) {
            const sinceTime = sinceDate.getTime();
            filteredEndorsements = filteredEndorsements.filter(e => new Date(e.created_at).getTime() >= sinceTime);
            filteredBroadcasts = filteredBroadcasts.filter(b => new Date(b.created_at).getTime() >= sinceTime);
        }
    }

    // Merge and sort
    let mixed = [...shapedNeeds, ...filteredEndorsements, ...filteredBroadcasts];
    
    if (sortBy === 'budget_high') {
        mixed.sort((a, b) => {
            const bVal = b.type === 'need' ? (b.budgetMin || 0) : (b.needs?.budget_min || 0);
            const aVal = a.type === 'need' ? (a.budgetMin || 0) : (a.needs?.budget_min || 0);
            return bVal - aVal;
        });
    } else if (sortBy === 'budget_low') {
        mixed.sort((a, b) => {
            const bVal = b.type === 'need' ? (b.budgetMin || 0) : (b.needs?.budget_min || 0);
            const aVal = a.type === 'need' ? (a.budgetMin || 0) : (a.needs?.budget_min || 0);
            return aVal - bVal;
        });
    } else {
        mixed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return mixed;
};

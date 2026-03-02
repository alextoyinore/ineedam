import { supabase } from '../lib/supabase';

export interface Profile {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
    banner_url: string | null;
    bio: string | null;
}

export interface Need {
    id: string;
    title: string;
    description: string;
    category: string;
    budget_mode: string;
    budget_min: number | null;
    budget_max: number | null;
    currency: string;
    location: string | null;
    flexibility: string;
    image_url: string | null;
    created_at: string;
    profiles: Profile | null;
}

export interface ShapedNeed extends Need {
    author: string;
    authorAvatar: string | null;
    authorUsername: string | null;
    authorBio: string | null;
    authorBanner: string | null;
    budget: string;
    postedAt: string;
}

export const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
};

export const shapeNeed = (row: any): ShapedNeed => {
    let budget = '';
    if (row.budget_mode === 'range' && row.budget_max) {
        budget = `${row.currency}${row.budget_min?.toLocaleString()} – ${row.currency}${row.budget_max?.toLocaleString()}`;
    } else if (row.budget_mode === 'hourly') {
        budget = `${row.currency}${row.budget_min}/hr`;
    } else {
        budget = `${row.currency}${row.budget_min?.toLocaleString()}`;
    }

    const displayName = row.profiles?.display_name || row.username || 'Anonymous';

    return {
        ...row,
        author: displayName,
        authorAvatar: row.profiles?.avatar_url || null,
        authorUsername: row.profiles?.username || null,
        authorBio: row.profiles?.bio || null,
        authorBanner: row.profiles?.banner_url || null,
        budget,
        postedAt: timeAgo(row.created_at),
    };
};

export const fetchNeeds = async (from = 0, to = 9) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return (data || []).map(shapeNeed);
};

export const fetchNeedsByUser = async (userId: string, from = 0, to = 9) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .eq('user_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return (data || []).map(shapeNeed);
};

export const fetchMetCounts = async (userId: string) => {
    if (!userId) return { needsMet: 0, fulfilledRequests: 0 };

    // Needs Met (Helped others)
    const { count: needsMet, error: error1 } = await supabase
        .from('needs')
        .select('*', { count: 'exact', head: true })
        .eq('met_by_id', userId);

    // Fulfilled Requests (Own needs met)
    const { count: fulfilledRequests, error: error2 } = await supabase
        .from('needs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'met');

    if (error1 || error2) {
        console.error("Error fetching met counts", error1 || error2);
    }

    return {
        needsMet: needsMet || 0,
        fulfilledRequests: fulfilledRequests || 0
    };
};

export const searchNeeds = async ({ query, category }: { query?: string, category?: string }) => {
    let supabaseQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)');

    if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category && category !== 'All') {
        supabaseQuery = supabaseQuery.eq('category', category);
    }

    const { data, error } = await supabaseQuery
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(0, 19);

    if (error) throw error;
    return (data || []).map(shapeNeed);
};

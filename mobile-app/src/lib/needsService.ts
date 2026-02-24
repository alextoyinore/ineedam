import { supabase } from './supabase';

export const timeAgo = (dateStr: any) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

export const shapeNeed = (row: any) => {
    const categoryColorMap = {
        'Product': '#3b82f6',
        'Service': '#3b82f6',
        'Training': '#8b5cf6',
        'Housing & Real Estate': '#8b5cf6',
        'Events & Gig Work': '#10b981',
        'Software & Tech': '#10b981',
        'Creative Arts': '#3b82f6',
        'Vehicles': '#10b981',
    };

    let budget = '';
    if (row.budget_mode === 'range' && row.budget_max) {
        budget = `${row.currency}${row.budget_min?.toLocaleString()} – ${row.currency}${row.budget_max?.toLocaleString()}`;
    } else if (row.budget_mode === 'hourly') {
        budget = `${row.currency}${row.budget_min}/hr`;
    } else {
        budget = `${row.currency}${row.budget_min?.toLocaleString()}`;
    }

    const displayName = row.profiles?.display_name || row.user_id?.slice(0, 8) || 'Anonymous';

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        categoryColor: (categoryColorMap as any)[row.category] || '#3b82f6',
        budget,
        location: row.location || 'Remote',
        flexibility: row.flexibility,
        postedAt: timeAgo(row.created_at),
        author: displayName,
        authorId: row.profiles?.id || row.user_id,
        authorUsername: row.profiles?.username || null,
        authorBio: row.profiles?.bio || null,
        authorAvatar: row.profiles?.avatar_url || null,
        authorBanner: row.profiles?.banner_url || null,
        imageUrl: row.image_url || undefined,
        status: row.status || 'open',
        metById: row.met_by_id || null,
        budgetMode: row.budget_mode,
        budgetMin: row.budget_min,
        budgetMax: row.budget_max,
        currency: row.currency,
        created_at: row.created_at,
    };
};

export const updateNeedStatus = async (id: string, status: string, metById: string | null = null) => {
    const updates: any = { status };
    if (metById) updates.met_by_id = metById;

    const { data, error } = await supabase
        .from('needs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getNeedById = async (id: string) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .eq('id', id)
        .single();
    if (error) {
        console.error('Error fetching need details:', error);
        return null;
    }
    return data;
};

export const fetchNeeds = async (from: any = 0, to: any = 9) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data;
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
    return data;
};

export const fetchMetCounts = async (userId: any) => {
    if (!userId) return { needsMet: 0, fulfilledRequests: 0 };

    const { count: needsMet, error: error1 } = await supabase
        .from('needs')
        .select('*', { count: 'exact', head: true })
        .eq('met_by_id', userId);

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

export const getCategoryStats = async (since: string | null = null) => {
    let query = supabase.from('needs').select('category').neq('status', 'archived');
    if (since) query = query.gte('created_at', since);

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching category stats", error);
        return {};
    }

    const stats = (data || []).reduce((acc: any, row: any) => {
        acc[row.category] = (acc[row.category] || 0) + 1;
        return acc;
    }, {});

    return stats;
};

export const searchNeeds = async ({ query, category, minBudget, maxBudget, from = 0, to = 9 }: any) => {
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

    const { data, error } = await supabaseQuery
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data;
};

export const getCategoryPreviews = async () => {
    const { data, error } = await supabase
        .from('needs')
        .select('id, title, category, created_at, profiles!needs_user_id_fkey(display_name, username)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching category previews', error);
        return [];
    }

    const grouped: any = {};
    for (const row of (data || [])) {
        if (!grouped[row.category]) {
            grouped[row.category] = {
                category: row.category,
                count: 0,
                latestNeed: {
                    id: row.id,
                    title: row.title,
                    author: (Array.isArray(row.profiles) ? row.profiles[0]?.display_name : row.profiles?.display_name) ||
                        (Array.isArray(row.profiles) ? row.profiles[0]?.username : row.profiles?.username) ||
                        'Someone',
                },
            };
        }
        grouped[row.category].count += 1;
    }

    return Object.values(grouped).sort((a: any, b: any) => b.count - a.count);
};

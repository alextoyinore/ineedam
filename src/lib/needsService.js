import { supabase } from './supabase';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a File object to Cloudinary.
 * Returns the secure URL string, or throws on failure.
 */
export const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'ineedam/needs');

    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.secure_url;
};

/**
 * Upload any file (image, PDF, doc, etc.) to Cloudinary for chat messages.
 * Returns { url, fileType } or throws on failure.
 */
export const uploadFileToCloudinary = async (file) => {
    const isImage = file.type.startsWith('image/');
    // For audio and video files Cloudinary works best with 'auto' or 'video' resource types.
    // 'raw' is only for files that Cloudinary shouldn't attempt to process (e.g. PDF, DOCX).
    const resourceType = isImage ? 'image' : (file.type.startsWith('audio/') ? 'video' : 'raw');
    const uploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'ineedam/messages');

    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('File upload failed');
    const data = await res.json();
    return { url: data.secure_url, fileType: file.type };
};

/**
 * Insert a new need into Supabase.
 * @param {object} needData - form fields
 * @param {string} userId   - auth user id
 */
export const createNeed = async (needData, userId) => {
    const { data, error } = await supabase
        .from('needs')
        .insert([{
            user_id: userId,
            title: needData.title,
            description: needData.description,
            category: needData.category,
            budget_mode: needData.budgetMode,
            budget_min: needData.budgetMin ? parseFloat(needData.budgetMin) : null,
            budget_max: needData.budgetMax ? parseFloat(needData.budgetMax) : null,
            currency: needData.currency,
            location: needData.location || null,
            flexibility: needData.flexibility,
            image_url: needData.imageUrl || null,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Fetch all needs ordered by newest first.
 */
export const fetchNeeds = async (from = 0, to = 9) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data;
};

/**
 * Fetch all needs for a specific user ID.
 */
export const fetchNeedsByUser = async (userId, from = 0, to = 9) => {
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

/**
 * Fetch a single need by ID.
 */
export const getNeedById = async (id) => {
    const { data, error } = await supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Shape a raw Supabase need row into the format NeedCard expects.
 */
export const shapeNeed = (row) => {
    const categoryColorMap = {
        'Product': 'secondary',
        'Service': 'secondary',
        'Training': 'accent',
        'Housing & Real Estate': 'accent',
        'Events & Gig Work': 'primary',
        'Software & Tech': 'primary',
        'Creative Arts': 'secondary',
        'Vehicles': 'primary',
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
        categoryColor: categoryColorMap[row.category] || 'primary',
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
        created_at: row.created_at
    };
};

/**
 * Update a need's status or met_by_id.
 */
export const updateNeedStatus = async (needId, status, metById = null) => {
    const updates = { status };
    if (metById) updates.met_by_id = metById;

    const { data, error } = await supabase
        .from('needs')
        .update(updates)
        .eq('id', needId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update a need's fields.
 */
export const updateNeed = async (needId, updates) => {
    const { data, error } = await supabase
        .from('needs')
        .update(updates)
        .eq('id', needId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Fetch fulfillment counts for a specific user.
 */
export const fetchMetCounts = async (userId) => {
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

/**
 * Get stats of needs per category.
 * @param {string|null} since - optional ISO date string to filter from (e.g. past 24h, past 3h)
 */
export const getCategoryStats = async (since = null) => {
    let query = supabase.from('needs').select('category').neq('status', 'archived');
    if (since) query = query.gte('created_at', since);

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching category stats", error);
        return {};
    }

    const stats = data.reduce((acc, row) => {
        acc[row.category] = (acc[row.category] || 0) + 1;
        return acc;
    }, {});

    return stats;
};

/**
 * Search and filter needs in Supabase.
 * @param {object} params - { query, category, minBudget, maxBudget }
 */
export const searchNeeds = async ({ query, category, minBudget, maxBudget }) => {
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

    // Defaulting to 0-9 if no page logic passed, though often handled via from/to
    const { data, error } = await supabaseQuery
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .range(from || 0, to || 9);

    if (error) throw error;
    return data;
};

/**
 * Fetch all categories with their need count and latest need, sorted by engagement desc.
 * Returns: [{ category, count, latestNeed: { id, title, author } }]
 */
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

    // Group by category: track count and keep the first row (latest) per category
    const grouped = {};
    for (const row of data) {
        if (!grouped[row.category]) {
            grouped[row.category] = {
                category: row.category,
                count: 0,
                latestNeed: {
                    id: row.id,
                    title: row.title,
                    author: row.profiles?.display_name || row.profiles?.username || 'Someone',
                },
            };
        }
        grouped[row.category].count += 1;
    }

    return Object.values(grouped).sort((a, b) => b.count - a.count);
};

export const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

import { supabase } from './supabase';

/**
 * Fetch a profile by user ID.
 */
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update a user's profile.
 */
export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
/**
 * Search for profiles by display name or username.
 */
export const searchProfiles = async (query, limit = 10) => {
    if (!query) return [];

    let filter = '';
    const cleanQuery = query.trim();

    if (cleanQuery.startsWith('@')) {
        const usernamePart = cleanQuery.slice(1);
        if (!usernamePart) return [];
        filter = `username.ilike.%${usernamePart}%`;
    } else {
        filter = `display_name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(filter)
        .limit(limit);

    if (error) {
        console.error("Error searching profiles:", error);
        return [];
    }

    return data;
};

/**
 * Fetch a profile by exact username.
 */
export const getProfileByUsername = async (username) => {
    if (!username) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase().replace('@', ''))
        .single();

    if (error) return null;
    return data;
};

/**
 * Fetch suggested profiles (users not currently followed).
 */
export const getSuggestedProfiles = async (currentUserId, limit = 5) => {
    // 1. Get IDs of users already followed
    const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

    if (followsError) {
        console.error("Error fetching follows for suggestions", followsError);
        return [];
    }

    const followedIds = follows.map(f => f.following_id);
    // Include the user themselves
    followedIds.push(currentUserId);

    // 2. Fetch profiles not in that list
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${followedIds.join(',')})`)
        .limit(limit);

    if (profilesError) {
        console.error("Error fetching suggested profiles", profilesError);
        return [];
    }

    return profiles;
};

/**
 * Check if a username is available.
 */
export const isUsernameAvailable = async (username, excludeUserId = null) => {
    if (!username) return false;
    const cleanUsername = username.toLowerCase().trim();

    let query = supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername);

    if (excludeUserId) {
        query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error checking username availability:", error);
        return false;
    }

    return data.length === 0;
};

/**
 * Calculate a user's response rate — the % of their needs where they
 * replied to at least one helper within 48 hours of the first reply.
 * Returns { responded: number, total: number, rate: number } (rate = 0-100)
 */
export const fetchResponseRate = async (userId) => {
    if (!userId) return { responded: 0, total: 0, rate: null };

    try {
        // Fetch the user's last 30 open/met needs
        const { data: needs, error: needsError } = await supabase
            .from('needs')
            .select('id, created_at')
            .eq('user_id', userId)
            .in('status', ['open', 'met'])
            .order('created_at', { ascending: false })
            .limit(30);

        if (needsError || !needs?.length) return { responded: 0, total: 0, rate: null };

        const needIds = needs.map(n => n.id);

        // Fetch all replies for those needs
        const { data: replies, error: repliesError } = await supabase
            .from('replies')
            .select('need_id, user_id, created_at')
            .in('need_id', needIds)
            .is('endorsement_id', null);

        if (repliesError) return { responded: 0, total: needs.length, rate: null };

        const repliesByNeed = {};
        (replies || []).forEach(r => {
            if (!repliesByNeed[r.need_id]) repliesByNeed[r.need_id] = [];
            repliesByNeed[r.need_id].push(r);
        });

        let responded = 0;
        let totalResponseTimeMs = 0;
        let responseCount = 0;
        const FOURTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

        for (const need of needs) {
            const needReplies = repliesByNeed[need.id] || [];
            const externalReplies = needReplies.filter(r => r.user_id !== userId);
            const ownerReplies = needReplies.filter(r => r.user_id === userId);

            if (!externalReplies.length) continue; 

            const firstExternal = externalReplies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
            const validOwnerReplies = ownerReplies
                .filter(r => new Date(r.created_at) >= new Date(firstExternal.created_at))
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            if (validOwnerReplies.length > 0) {
                const firstOwnerReply = validOwnerReplies[0];
                const diff = new Date(firstOwnerReply.created_at).getTime() - new Date(firstExternal.created_at).getTime();
                
                if (diff <= FOURTY_EIGHT_HOURS) {
                    responded++;
                }

                totalResponseTimeMs += diff;
                responseCount++;
            }
        }

        const total = needs.filter(n => (repliesByNeed[n.id] || []).some(r => r.user_id !== userId)).length;
        const rate = total > 0 ? Math.round((responded / total) * 100) : null;

        // Calculate Average Response Time String
        let averageResponseTime = null;
        if (responseCount > 0) {
            const avgMs = totalResponseTimeMs / responseCount;
            const mins = Math.floor(avgMs / 60000);
            if (mins < 60) averageResponseTime = `${mins}m`;
            else {
                const hrs = Math.floor(mins / 60);
                if (hrs < 24) averageResponseTime = `${hrs}h`;
                else {
                    const days = Math.floor(hrs / 24);
                    averageResponseTime = `${days}d`;
                }
            }
        }

        return { responded, total, rate, averageResponseTime };
    } catch (err) {
        console.error('Error calculating response rate:', err);
        return { responded: 0, total: 0, rate: null, averageResponseTime: null };
    }
};


/**
 * Format display name based on length and word count (Mobile only).
 * If isMobile is true:
 * - If full name < 15 chars, show full name.
 * - Otherwise, if multiple words, show first word.
 * - If single word >= 15 chars, truncate at 10 chars.
 */
export const formatDisplayName = (name, isMobile = false) => {
    if (!name || !isMobile) return name || '';
    const trimmed = name.trim();
    
    if (trimmed.length < 15) {
        return trimmed;
    }
    
    const words = trimmed.split(/\s+/);
    if (words.length > 1) {
        return words[0];
    }
    
    return trimmed.substring(0, 10).trim() + '...';
};

/**
 * Format username (Mobile only): truncate at 10 characters if longer.
 */
export const formatUsername = (username, isMobile = false) => {
    if (!username || !isMobile) return username || '';
    const clean = username.replace(/^@/, '');
    if (clean.length > 10) {
        return clean.substring(0, 10) + '...';
    }
    return clean;
};

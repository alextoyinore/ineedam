import { supabase } from './supabase';

/**
 * Fetch a profile by user ID.
 */
export const getProfile = async (userId: any) => {
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
export const updateProfile = async (userId: any, updates: any) => {
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
export const searchProfiles = async (query: any, limit: any = 10) => {
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
export const getProfileByUsername = async (username: any) => {
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
export const getSuggestedProfiles = async (currentUserId: any, limit: any = 5) => {
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
export const isUsernameAvailable = async (username: any, excludeUserId: any = null) => {
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

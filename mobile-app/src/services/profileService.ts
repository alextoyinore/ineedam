import { supabase } from '../lib/supabase';

/**
 * Fetch a profile by user ID.
 */
export const getProfile = async (userId: string) => {
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
export const updateProfile = async (userId: string, updates: any) => {
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
 * Fetch suggested profiles (users not currently followed).
 */
export const getSuggestedProfiles = async (currentUserId: string, limit = 15) => {
    // 1. Get IDs of users already followed
    const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

    if (followsError) {
        console.error("Error fetching follows for suggestions", followsError);
        return [];
    }

    const followedIds = (follows || []).map(f => f.following_id);
    // Include the user themselves
    followedIds.push(currentUserId);

    // 2. Fetch profiles not in that list
    // Note: Supabase 'not' with 'in' filter needs a specific format
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

import { supabase } from './supabase';

/**
 * Create an endorsement from a need owner to the person who helped them.
 * @param {string} endorserId - The need owner's profile id
 * @param {string} endorsedId - The helper's profile id
 * @param {string} needId - The met need's id
 * @param {string} message - Appreciation message
 */
export const createEndorsement = async (endorserId, endorsedId, needId, message) => {
    const { data, error } = await supabase
        .from('endorsements')
        .insert([{ endorser_id: endorserId, endorsed_id: endorsedId, need_id: needId, message }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Fetch endorsements received by a user (for their profile Endorsements tab).
 * Returns full endorsement objects with endorser profile and need details.
 * @param {string} userId - The profile being viewed
 */
export const fetchEndorsementsForUser = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('endorsements')
        .select(`
            id, message, created_at,
            endorser_id,
            need_id,
            profiles!endorsements_endorser_id_fkey (
                id, display_name, username, avatar_url
            ),
            needs (
                id, title, description, category, status
            )
        `)
        .eq('endorsed_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching endorsements:', error);
        return [];
    }
    return data;
};

/**
 * Check if a given need already has an endorsement.
 * @param {string} needId
 */
export const getEndorsementForNeed = async (needId) => {
    if (!needId) return null;
    const { data, error } = await supabase
        .from('endorsements')
        .select('id, message')
        .eq('need_id', needId)
        .maybeSingle();
    if (error) return null;
    return data;
};

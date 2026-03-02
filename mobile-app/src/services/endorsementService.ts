import { supabase } from '../lib/supabase';

export const fetchEndorsementsForUser = async (userId: string) => {
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

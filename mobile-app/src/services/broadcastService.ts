import { supabase } from '../lib/supabase';
import { shapeNeed } from './needsService';

export const fetchBroadcastedNeeds = async (userId: string) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            id, created_at,
            profiles (id, display_name, username, avatar_url),
            needs (
                id, title, description, category, budget_mode, budget_min, budget_max,
                currency, location, flexibility, image_url, status, created_at,
                profiles!needs_user_id_fkey (
                    id, display_name, username, avatar_url
                )
            ),
            endorsements (
                id, message, created_at,
                endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio),
                endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio),
                needs:needs(id, title, category, budget_min, status)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching broadcasted needs:', error);
        return [];
    }

    return (data || []).map(b => {
        if (b.needs) {
            return {
                ...shapeNeed(b.needs),
                type: 'broadcast',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        } else if (b.endorsements) {
            return {
                ...b.endorsements,
                type: 'broadcast_endorsement',
                broadcast_id: b.id,
                broadcast_created_at: b.created_at,
                broadcasted_by: b.profiles,
                created_at: b.created_at
            };
        }
        return null;
    }).filter(b => b && b.broadcast_id);
};

import { supabase } from '../lib/supabase';
import { shapeNeed } from './needsService';

export const fetchBookmarkedItems = async (userId: string) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('bookmarks')
        .select(`
            need_id,
            endorsement_id,
            created_at,
            needs (
                *,
                profiles!needs_user_id_fkey (
                    display_name, username, avatar_url, banner_url, bio
                )
            ),
            endorsements (
                id, message, created_at,
                endorser_id, endorsed_id, need_id,
                endorser:profiles!endorsements_endorser_id_fkey (id, display_name, username, avatar_url, bio),
                endorsed:profiles!endorsements_endorsed_id_fkey (id, display_name, username, avatar_url, bio),
                needs (id, title, description, category, status)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }

    return (data || []).map((b: any) => {
        if (b.need_id && b.needs) return { ...shapeNeed(b.needs), type: 'need' };
        if (b.endorsement_id && b.endorsements) return { ...b.endorsements, type: 'endorsement' };
        return null;
    }).filter(Boolean);
};

export const isBookmarked = async (userId: string, targetId: string, type = 'need') => {
    const col = type === 'need' ? 'need_id' : 'endorsement_id';
    const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq(col, targetId)
        .maybeSingle();
    return !!data;
};

export const toggleBookmark = async (userId: string, targetId: string, type = 'need') => {
    const col = type === 'need' ? 'need_id' : 'endorsement_id';
    const currently = await isBookmarked(userId, targetId, type);
    if (currently) {
        await supabase.from('bookmarks').delete().eq('user_id', userId).eq(col, targetId);
        return false;
    } else {
        await supabase.from('bookmarks').insert([{ user_id: userId, [col]: targetId }]);
        return true;
    }
};

export const fetchRepliesForNeed = async (needId: string) => {
    const { data, error } = await supabase
        .from('replies')
        .select('*, profiles(display_name, avatar_url, username)')
        .eq('need_id', needId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};

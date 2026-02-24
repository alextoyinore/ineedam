import { supabase } from './supabase';
import { shapeNeed } from './needsService';
import { timeAgo } from './needsService';

export const fetchAllEndorsements = async (from: any = 0, to: any = 9, followingIds: string[] | null = null) => {
    let query = supabase
        .from('endorsements')
        .select(`
            id, message, created_at,
            endorser_id,
            endorsed_id,
            need_id,
            endorser:profiles!endorsements_endorser_id_fkey(id, display_name, username, avatar_url, bio),
            endorsed:profiles!endorsements_endorsed_id_fkey(id, display_name, username, avatar_url, bio),
            needs(id, title)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (followingIds && followingIds.length > 0) {
        // Find endorsements where either the endorser or endorsed user is followed
        query = query.or(`endorser_id.in.(${followingIds.join(',')}),endorsed_id.in.(${followingIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching endorsements:', error);
        return [];
    }

    return data.map((e: any) => ({
        ...e,
        type: 'endorsement',
        postedAt: timeAgo(e.created_at)
    }));
};

export const fetchMixedFeed = async (from: any = 0, to: any = 5, feedType: 'global' | 'following' = 'global', currentUserId: string | null = null) => {
    let followingIds: string[] = [];

    if (feedType === 'following' && currentUserId) {
        const { data: follows, error: followsError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId);

        if (!followsError && follows) {
            followingIds = follows.map((f: any) => f.following_id);
        }
    }

    let needsQuery = supabase
        .from('needs')
        .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username, banner_url, bio)')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (feedType === 'following' && followingIds.length > 0) {
        needsQuery = needsQuery.in('user_id', followingIds);
    } else if (feedType === 'following' && followingIds.length === 0) {
        // Following nobody, return empty
        return [];
    }

    const [{ data: needsData, error: needsError }, endorsements] = await Promise.all([
        needsQuery,
        fetchAllEndorsements(from, to, feedType === 'following' ? followingIds : null)
    ]);

    if (needsError) throw needsError;

    const shapedNeeds = (needsData || []).map((need: any) => ({
        ...shapeNeed(need),
        type: 'need',
        created_at: need.created_at
    }));

    const mixed = [...shapedNeeds, ...endorsements].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return mixed;
};


import { supabase } from './supabase';

/**
 * Creates an automatic "Need Story" testimonial when a need is met.
 * @param {string} needId - The ID of the met need.
 * @param {object} helperProfile - The profile of the person who helped.
 */
export const createNeedStory = async (needId, helperProfile) => {
    try {
        // 1. Fetch need details and responder count
        const { data: need, error: needError } = await supabase
            .from('needs')
            .select(`
                *,
                replies (count)
            `)
            .eq('id', needId)
            .single();

        if (needError) throw needError;

        // 2. Calculate responder count (unique users who replied)
        const { data: responders, error: respError } = await supabase
            .from('replies')
            .select('user_id', { count: 'exact', head: false })
            .eq('need_id', needId);
            
        if (respError) throw respError;
        
        const uniqueResponders = new Set(responders.map(r => r.user_id)).size;

        // 3. Create the story record
        const { error: storyError } = await supabase
            .from('need_stories')
            .insert({
                need_id: needId,
                poster_id: need.user_id,
                helper_id: helperProfile.id,
                title: need.title,
                responder_count: uniqueResponders,
                outcome: 'Met successfully' // Default outcome
            });

        if (storyError) throw storyError;
        
        console.log('[NeedStory] Story created successfully for need:', needId);
        return { success: true };
    } catch (err) {
        console.error('[NeedStory] Error creating story:', err);
        return { error: err };
    }
};

/**
 * Fetches need stories for a specific user (as poster or helper).
 * @param {string} userId
 */
export const fetchNeedStories = async (userId) => {
    const { data, error } = await supabase
        .from('need_stories')
        .select(`
            *,
            poster:poster_id (display_name, username, avatar_url),
            helper:helper_id (display_name, username, avatar_url)
        `)
        .or(`poster_id.eq.${userId},helper_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    return { data, error };
};

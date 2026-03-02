import { supabase } from '../lib/supabase';

export const fetchRepliesByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('replies')
        .select('*, needs(title), profiles(display_name, avatar_url, username)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createReply = async (needId: string, userId: string, content: string, isPrivate = false) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            need_id: needId,
            user_id: userId,
            content: content,
            is_private: isPrivate
        }])
        .select('*, profiles(display_name, avatar_url, username)')
        .single();

    if (error) throw error;
    return data;
};

export const updateReplyStatus = async (replyId: string, status: string) => {
    const { error } = await supabase
        .from('replies')
        .update({ status })
        .eq('id', replyId);
    if (error) throw error;
};

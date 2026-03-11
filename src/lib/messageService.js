import { supabase } from './supabase';

/**
 * Fetch all threads for a specific user, including the other participant's profile,
 * and the latest message for the preview.
 */
export const fetchUserThreads = async (userId) => {
    if (!userId) return [];

    // 1. Get thread IDs the user is a part of
    const { data: participations, error: partError } = await supabase
        .from('thread_participants')
        .select('thread_id, last_read_at')
        .eq('user_id', userId);

    if (partError || !participations?.length) return [];

    const threadIds = participations.map(p => p.thread_id);

    // 2. Fetch those threads, ordering by updated_at
    const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
            id,
            updated_at,
            thread_participants(user_id, last_read_at, profiles!inner(display_name, avatar_url, username, last_seen_at)),
            messages(
                id, text, file_url, file_type, created_at, sender_id, reply_to,
                message_reactions(id, emoji, user_id),
                message_bookmarks(user_id)
            )
        `)
        .in('id', threadIds)
        .order('updated_at', { ascending: false });

    if (threadsError) {
        console.error("Error fetching threads", threadsError);
        return [];
    }

    // Process shape for UI context
    return threadsData.map(thread => {
        // Find the *other* participant in this thread
        const otherParticipant = thread.thread_participants.find(tp => tp.user_id !== userId);
        const myParticipant = thread.thread_participants.find(tp => tp.user_id === userId);

        // Sort messages manually just in case, taking the last one
        const sortedMessages = thread.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const lastMessage = sortedMessages[sortedMessages.length - 1];

        // Is it unread? If the last message is from someone else AND it's newer than the user's last_read_at
        const isUnread = lastMessage &&
            lastMessage.sender_id !== userId &&
            (!myParticipant.last_read_at || new Date(lastMessage.created_at) > new Date(myParticipant.last_read_at));

        return {
            id: thread.id,
            senderId: userId,
            withUserId: otherParticipant?.user_id || 'unknown',
            withUser: otherParticipant?.profiles?.display_name || 'Anonymous',
            withUserAvatar: otherParticipant?.profiles?.avatar_url,
            withUserUsername: otherParticipant?.profiles?.username,
            withUserLastSeenAt: otherParticipant?.profiles?.last_seen_at,
            lastMessage: lastMessage?.text || '',
            timestamp: thread.updated_at,
            unread: isUnread,
            // Recipient's last_read_at — used for read receipts (double ticks)
            recipientLastReadAt: otherParticipant?.last_read_at || null,
            // Only keeping full message history if actively requested, but for context we pass the array
            messages: sortedMessages.map(m => ({
                id: m.id,
                senderId: m.sender_id,
                sender: m.sender_id === userId ? 'Me' : (otherParticipant?.profiles?.display_name || 'Them'),
                text: m.text,
                fileUrl: m.file_url || null,
                fileType: m.file_type || null,
                timestamp: m.created_at,
                replyTo: m.reply_to,
                reactions: m.message_reactions || [],
                isBookmarked: m.message_bookmarks?.some(b => b.user_id === userId) || false
            }))
        };
    });
};

/**
 * Ensures a thread exists between the current user and target user, returning the thread ID.
 * If one doesn't exist, it creates it.
 */
export const getOrCreateThread = async (userId1, userId2) => {
    // Manual JS intersection
    const { data: p1 } = await supabase.from('thread_participants').select('thread_id').eq('user_id', userId1);
    const { data: p2 } = await supabase.from('thread_participants').select('thread_id').eq('user_id', userId2);

    const p1Ids = p1?.map(p => p.thread_id) || [];
    const p2Ids = p2?.map(p => p.thread_id) || [];
    const commonThreadId = p1Ids.find(id => p2Ids.includes(id));

    if (commonThreadId) return commonThreadId;

    // Create new thread
    const { data: newThread, error: insertError } = await supabase
        .from('threads')
        .insert([{}])
        .select()
        .single();

    if (insertError) throw insertError;

    // Add participants
    // We insert them separately so RLS check (auth.uid() = user_id) works for the current user,
    // and we'll need an updated RLS for the other participant.
    const { error: p1Error } = await supabase.from('thread_participants').insert([{ thread_id: newThread.id, user_id: userId1 }]);
    if (p1Error) throw p1Error;

    const { error: p2Error } = await supabase.from('thread_participants').insert([{ thread_id: newThread.id, user_id: userId2 }]);
    if (p2Error) throw p2Error;

    return newThread.id;
};

/**
 * Insert a message into a thread, with an optional file attachment and reply context.
 */
export const createMessage = async (threadId, senderId, text, fileUrl = null, fileType = null, replyTo = null) => {
    const payload = { thread_id: threadId, sender_id: senderId, text: text || '' };
    if (fileUrl) payload.file_url = fileUrl;
    if (fileType) payload.file_type = fileType;
    if (replyTo) payload.reply_to = replyTo;

    const { data, error } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Error creating message:", error);
        throw error;
    }

    return data;
};

/**
 * Mark a thread as read by updating last_read_at
 */
export const markThreadAsReadInDb = async (threadId, userId) => {
    const { error } = await supabase
        .from('thread_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', userId);

    if (error) console.error("Error marking thread read:", error);
};

/**
 * Toggle an emoji reaction on a message.
 * Returns { success: true } or throws.
 */
export const toggleMessageReaction = async (messageId, userId, emoji) => {
    // Check if it already exists
    const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .maybeSingle();

    if (existing) {
        // Remove it
        const { error } = await supabase
            .from('message_reactions')
            .delete()
            .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
    } else {
        // Add it
        const { error } = await supabase
            .from('message_reactions')
            .insert([{ message_id: messageId, user_id: userId, emoji }]);
        if (error) throw error;
        return { action: 'added' };
    }
};

/**
 * Toggle a bookmark on a message for a user.
 */
export const toggleMessageBookmark = async (messageId, userId) => {
    // Check if it already exists
    const { data: existing } = await supabase
        .from('message_bookmarks')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        // Remove bookmark
        const { error } = await supabase
            .from('message_bookmarks')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userId);
        if (error) throw error;
        return { action: 'removed' };
    } else {
        // Add bookmark
        const { error } = await supabase
            .from('message_bookmarks')
            .insert([{ message_id: messageId, user_id: userId }]);
        if (error) throw error;
        return { action: 'added' };
    }
};

/**
 * Edit a specific message
 */
export const editChatMessage = async (messageId, userId, newText) => {
    const { error } = await supabase
        .from('messages')
        .update({ text: newText })
        .eq('id', messageId)
        .eq('sender_id', userId);
    if (error) throw error;
    return true;
};

/**
 * Delete a specific message
 */
export const deleteChatMessage = async (messageId, userId) => {
    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);
    if (error) throw error;
    return true;
};

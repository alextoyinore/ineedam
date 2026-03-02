import { supabase } from '../lib/supabase';

export interface Message {
    id: string;
    senderId: string;
    sender: string;
    text: string;
    fileUrl: string | null;
    fileType: string | null;
    timestamp: string;
}

export interface Thread {
    id: string;
    withUserId: string;
    withUser: string;
    withUserAvatar: string | null;
    withUserUsername: string | null;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    messages: Message[];
}

export const fetchUserThreads = async (userId: string): Promise<Thread[]> => {
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
      thread_participants(user_id, last_read_at, profiles!inner(display_name, avatar_url, username)),
      messages(id, text, file_url, file_type, created_at, sender_id)
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
        const otherParticipant: any = thread.thread_participants.find((tp: any) => tp.user_id !== userId);
        const myParticipant: any = thread.thread_participants.find((tp: any) => tp.user_id === userId);

        // Sort messages manually just in case, taking the last one
        const sortedMessages = (thread.messages as any[]).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const lastMessage = sortedMessages[sortedMessages.length - 1];

        // Is it unread? If the last message is from someone else AND it's newer than the user's last_read_at
        const isUnread = lastMessage &&
            lastMessage.sender_id !== userId &&
            (!myParticipant.last_read_at || new Date(lastMessage.created_at).getTime() > new Date(myParticipant.last_read_at).getTime());

        return {
            id: thread.id,
            withUserId: otherParticipant?.user_id || 'unknown',
            withUser: otherParticipant?.profiles?.display_name || 'Anonymous',
            withUserAvatar: otherParticipant?.profiles?.avatar_url || null,
            withUserUsername: otherParticipant?.profiles?.username || null,
            lastMessage: lastMessage?.text || '',
            timestamp: thread.updated_at,
            unread: isUnread,
            messages: sortedMessages.map(m => ({
                id: m.id,
                senderId: m.sender_id,
                sender: m.sender_id === userId ? 'Me' : (otherParticipant?.profiles?.display_name || 'Them'),
                text: m.text,
                fileUrl: m.file_url || null,
                fileType: m.file_type || null,
                timestamp: m.created_at
            }))
        };
    });
};

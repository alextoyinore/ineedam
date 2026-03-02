import { supabase } from '../lib/supabase';

export interface Notification {
    id: string;
    user_id: string;
    type: 'like' | 'reply' | 'follow' | 'broadcast' | string;
    actor_id: string;
    message: string;
    reference_id: string | null;
    read: boolean;
    created_at: string;
    actorProfile: {
        display_name: string | null;
        avatar_url: string | null;
        username: string | null;
    } | null;
}

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select(`
      *,
      actorProfile:profiles!notifications_actor_id_fkey (
        display_name,
        avatar_url,
        username
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    return data as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error("Error marking notification read:", error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async (userId: string) => {
    if (!userId) return;

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error("Error marking all notifications read:", error);
        throw error;
    }
};

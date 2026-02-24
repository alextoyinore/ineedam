import { supabase } from './supabase';

/**
 * Fetch all notifications for a specific user.
 */
export const fetchNotifications = async (userId: any) => {
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

    return data;
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationAsRead = async (notificationId: any) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error("Error marking notification read:", error);
        throw error;
    }
};

/**
 * Mark all notifications for a user as read.
 */
export const markAllNotificationsAsRead = async (userId: any) => {
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

/**
 * Delete all notifications for a user (clear all).
 */
export const clearAllNotifications = async (userId: any) => {
    if (!userId) return;

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error("Error clearing notifications:", error);
        throw error;
    }
};

/**
 * Create a new notification.
 */
export const createNotification = async (userId: any, type: any, actorId: any, message: any, referenceId: any = null) => {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            user_id: userId,
            type: type,
            actor_id: actorId,
            message: message,
            reference_id: referenceId,
            read: false
        }]);

    if (error) {
        console.error("Error creating notification:", error);
        throw error;
    }

    return data;
};

import { supabase } from './supabase';
import { createNotification } from './notificationService';

/**
 * Extracts usernames (mentions) from text using @ symbol.
 * Returns an array of unique usernames found.
 */
export const extractMentions = (text) => {
    if (!text) return [];
    // Requires start of line or space before @ to avoid matching emails
    const mentionRegex = /(?:^|\s)@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    // Extract capture group 1 (the username part) and remove duplicates
    const mentions = [...new Set(matches.map(match => match[1]))];
    return mentions;
};

/**
 * Notifies mentioned users in a piece of content.
 * @param {string} text - The content to parse for mentions.
 * @param {string} actorId - The ID of the user who made the post/reply.
 * @param {string} type - 'mention' or similar.
 * @param {string} referenceId - The ID of the need or reply where the mention happened.
 * @param {string} messagePrefix - Optional prefix for the notification message.
 */
export const handleMentions = async (text, actorId, type, referenceId, messagePrefix = 'mentioned you') => {
    const usernames = extractMentions(text);
    if (usernames.length === 0) return;

    try {
        // Fetch profiles for the mentioned usernames
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username')
            .in('username', usernames);

        if (error) throw error;

        if (profiles && profiles.length > 0) {
            const notifications = profiles
                .filter(p => p.id !== actorId) // Don't notify self
                .map(p => createNotification(
                    p.id,
                    type,
                    actorId,
                    `${messagePrefix}`,
                    referenceId
                ));

            await Promise.all(notifications);
        }
    } catch (err) {
        console.error("Failed to handle mentions:", err);
    }
};

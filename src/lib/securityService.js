import { supabase } from './supabase';

/**
 * Utility to hash a 4-digit PIN using the Web Crypto API.
 * This ensures we don't store plain text PINs in the database.
 * We use SHA-256 for simplicity as this is a low-entropy PIN, 
 * but it still prevents casual database snooping.
 * 
 * @param {string} pin - The 4-digit string.
 * @returns {Promise<string>} - The hex representation of the hashed PIN.
 */
export const hashPin = async (pin) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Checks if a user has a PIN setup.
 *
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<boolean>} - True if a pin hash exists.
 */
export const hasPinSetup = async (userId) => {
    if (!userId) return false;
    try {
        const { data, error } = await supabase
            .from('user_security')
            .select('message_pin_hash')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error checking pin setup:', error);
            return false;
        }

        return !!data?.message_pin_hash;
    } catch (err) {
        console.error('Unexpected error checking pin setup:', err);
        return false;
    }
};

/**
 * Sets or updates the user's message PIN.
 * 
 * @param {string} userId - The ID of the current user.
 * @param {string} newPin - The 4-digit PIN to set.
 * @returns {Promise<boolean>} - True if successful.
 */
export const setupMessagePin = async (userId, newPin) => {
    if (!userId || !newPin || newPin.length !== 4) return false;

    try {
        const hashedPin = await hashPin(newPin);

        // Upsert the security row
        const { error } = await supabase
            .from('user_security')
            .upsert({
                id: userId,
                message_pin_hash: hashedPin,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to setup message pin:', err);
        return false;
    }
};

/**
 * Verifies if the provided PIN matches the stored hash for the user.
 * 
 * @param {string} userId - The ID of the current user.
 * @param {string} pinToVerify - The 4-digit PIN to check.
 * @returns {Promise<boolean>} - True if the PIN matches.
 */
export const verifyMessagePin = async (userId, pinToVerify) => {
    if (!userId || !pinToVerify) return false;

    try {
        const { data, error } = await supabase
            .from('user_security')
            .select('message_pin_hash')
            .eq('id', userId)
            .single();

        if (error || !data?.message_pin_hash) return false;

        const hashedAttempt = await hashPin(pinToVerify);
        return hashedAttempt === data.message_pin_hash;
    } catch (err) {
        console.error('Failed to verify message pin:', err);
        return false;
    }
};

/**
 * Removes the user's message PIN.
 * 
 * @param {string} userId - The ID of the current user.
 * @returns {Promise<boolean>} - True if successful.
 */
export const removeMessagePin = async (userId) => {
    if (!userId) return false;

    try {
        const { error } = await supabase
            .from('user_security')
            .update({
                message_pin_hash: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to remove message pin:', err);
        return false;
    }
};

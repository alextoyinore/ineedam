import { supabase } from './supabase';

/**
 * Utility to hash a 4-digit PIN.
 * In a real React Native environment, you'd typically use 'expo-crypto'.
 * This implementation uses the Web Crypto API for web compatibility.
 */
export const hashPin = async (pin: string): Promise<string> => {
    // Check if we are in a web environment with crypto.subtle
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback or placeholder for native if expo-crypto is not yet installed
    console.warn('Crypto API not available. PIN hashing might not work on native without expo-crypto.');
    return pin; // This is unsafe, but allows the code to run until expo-crypto is added
};

/**
 * Checks if a user has a PIN setup.
 */
export const hasPinSetup = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
        const { data, error } = await supabase
            .from('user_security')
            .select('message_pin_hash')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
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
 */
export const setupMessagePin = async (userId: string, newPin: string): Promise<boolean> => {
    if (!userId || !newPin || newPin.length !== 4) return false;

    try {
        const hashedPin = await hashPin(newPin);

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
 */
export const verifyMessagePin = async (userId: string, pinToVerify: string): Promise<boolean> => {
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

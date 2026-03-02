import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_STORAGE_KEY_PREFIX = 'message_pin_';

/**
 * Hash a PIN using SHA-256
 */
export const hashPin = async (pin: string): Promise<string> => {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
    );
};

/**
 * Check if a user has a PIN setup
 */
export const hasPinSetup = async (userId: string): Promise<boolean> => {
    const storedHash = await AsyncStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`);
    return !!storedHash;
};

/**
 * Set up a new PIN for a user
 */
export const setupMessagePin = async (userId: string, pin: string): Promise<boolean> => {
    try {
        const hash = await hashPin(pin);
        await AsyncStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`);
        await AsyncStorage.setItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`, hash);
        return true;
    } catch (error) {
        console.error('Error setting up PIN:', error);
        return false;
    }
};

/**
 * Verify a user's PIN
 */
export const verifyMessagePin = async (userId: string, pin: string): Promise<boolean> => {
    try {
        const storedHash = await AsyncStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`);
        if (!storedHash) return false;

        const inputHash = await hashPin(pin);
        return storedHash === inputHash;
    } catch (error) {
        console.error('Error verifying PIN:', error);
        return false;
    }
};

/**
 * Remove a user's PIN
 */
export const removeMessagePin = async (userId: string): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(`${PIN_STORAGE_KEY_PREFIX}${userId}`);
        return true;
    } catch (error) {
        console.error('Error removing PIN:', error);
        return false;
    }
};

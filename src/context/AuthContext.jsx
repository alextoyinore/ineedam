import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getFCMToken } from '../lib/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(undefined); // undefined = loading, null = no session
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push messaging is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) return existingSubscription;

            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                console.error("VITE_VAPID_PUBLIC_KEY not found in environment");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            console.log('User is subscribed:', subscription);

            // Save to Supabase
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ push_subscription: subscription.toJSON() })
                    .eq('id', user.id);
            }

            return subscription;
        } catch (err) {
            console.error('Failed to subscribe user:', err);
        }
    };

    // --- Firebase Cloud Messaging Token Registration ---
    const subscribeToFCM = async () => {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) return; // Skip if Firebase not configured
        try {
            const token = await getFCMToken();
            if (!token) return;
            console.log('[FCM] Token obtained:', token);
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ fcm_token: token })
                    .eq('id', user.id);
                console.log('[FCM] Token saved to profile');
            }
        } catch (err) {
            console.error('[FCM] Failed to subscribe:', err);
        }
    };

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error("Error fetching profile in AuthContext:", err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Get initial session
        // Get initial session with a 5s timeout to prevent infinite loading on iOS
        const getSessionWithTimeout = Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Session timeout')), 5000))
        ]);

        getSessionWithTimeout
            .then(({ data: { session } }) => {
                setSession(session);
                const authUser = session?.user ?? null;
                setUser(authUser);
                if (authUser) fetchProfile(authUser.id);
            })
            .catch((err) => {
                console.warn('[AuthContext] getSession failed or timed out:', err.message);
                setSession(null); // Unblock the loader — treat as logged out
            });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            const authUser = session?.user ?? null;
            setUser(authUser);
            if (authUser) {
                fetchProfile(authUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Handle auto-subscription for verified/logged-in users
    useEffect(() => {
        if (user && profile) {
            // Update last_seen_at every 2 minutes
            const updateLastSeen = async () => {
                await supabase
                    .from('profiles')
                    .update({ last_seen_at: new Date().toISOString() })
                    .eq('id', user.id);
            };

            updateLastSeen(); // Initial update
            const heartbeat = setInterval(updateLastSeen, 2 * 60 * 1000);

            // Guard for iOS Safari which doesn't support Notifications API
            const notificationsSupported = typeof Notification !== 'undefined';
            if (notificationsSupported && (Notification.permission === 'default' || Notification.permission === 'granted')) {
                const timer = setTimeout(() => {
                    /* Existing Web Push (VAPID) subscription - Commented out
                    if (!profile.push_subscription) {
                        subscribeToPush();
                    }
                    */
                    // Firebase FCM subscription (independent)
                    if (!profile.fcm_token) {
                        subscribeToFCM();
                    }
                }, 3000);
                return () => {
                    clearTimeout(timer);
                    clearInterval(heartbeat);
                };
            }
            return () => clearInterval(heartbeat);
        }
    }, [user, profile]);

    const signUp = async (email, password, metaData, referredBy) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });

        // If signup was successful and we have a referrer, increment their points
        if (!error && referredBy && data?.user) {
            try {
                const { error: rpcError } = await supabase.rpc('increment_referral_points', { 
                    referrer_username: referredBy 
                });
                if (rpcError) console.error('[Referral] Error incrementing points:', rpcError);
                else console.log('[Referral] Points incremented for:', referredBy);
            } catch (err) {
                console.error('[Referral] RPC Exception:', err);
            }
        }
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resendVerification = async (email) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        return { error };
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
    };

    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { error };
    };

    const updateProfile = async (updates) => {
        if (!user) return { error: new Error('No user logged in') };
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);
            if (error) throw error;
            await fetchProfile(user.id); // Refresh local profile state
            return { error: null };
        } catch (err) {
            console.error("Error updating profile:", err);
            return { error: err };
        }
    };

    const loading = session === undefined;

    return (
        <AuthContext.Provider value={{
            session, user, profile, loading,
            signUp, signIn, signOut, fetchProfile,
            resendVerification, resetPassword, updatePassword,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

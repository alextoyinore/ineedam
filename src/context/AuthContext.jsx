import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            const authUser = session?.user ?? null;
            setUser(authUser);
            if (authUser) fetchProfile(authUser.id);
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
        if (user && profile && !profile.push_subscription) {
            // Check if permission is already granted or not denied
            if (Notification.permission === 'default' || Notification.permission === 'granted') {
                // We wrap in a short delay to ensure UI is ready or user is engaged
                const timer = setTimeout(() => {
                    subscribeToPush();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, profile]);

    const signUp = async (email, password, metaData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });
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

    const loading = session === undefined;

    return (
        <AuthContext.Provider value={{
            session, user, profile, loading,
            signUp, signIn, signOut, fetchProfile,
            resendVerification, resetPassword, updatePassword
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

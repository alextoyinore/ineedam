import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null | undefined;
    user: User | null;
    profile: any | null;
    loading: boolean;
    hasSeenOnboarding: boolean | null;
    signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signUp: (email: string, password: string, metaData?: any) => Promise<{ data: any; error: any }>;
    signOut: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile in AuthContext:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Check onboarding status
        AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
            setHasSeenOnboarding(value === 'true');
        });

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            setSession(initialSession);
            const authUser = initialSession?.user ?? null;
            setUser(authUser);
            if (authUser) fetchProfile(authUser.id);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            const authUser = newSession?.user ?? null;
            setUser(authUser);
            if (authUser) {
                fetchProfile(authUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, metaData?: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData,
            },
        });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            setHasSeenOnboarding(true);
        } catch (e) {
            console.error('Error saving onboarding state:', e);
        }
    };

    const loading = session === undefined;

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                loading,
                hasSeenOnboarding,
                signUp,
                signIn,
                signOut,
                fetchProfile,
                completeOnboarding,
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null | undefined;
    user: User | null;
    profile: any | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string, metaData: any) => Promise<any>;
    signOut: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);

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

    const signIn = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email: string, password: string, metaData: any) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const loading = session === undefined;

    return (
        <AuthContext.Provider value={{
            session, user, profile, loading,
            signIn, signUp, signOut, fetchProfile
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

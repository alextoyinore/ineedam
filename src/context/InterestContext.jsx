import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserInterests, toggleInterest as toggleInterestService } from '../lib/interestService';

const InterestContext = createContext(null);

export const InterestProvider = ({ children }) => {
    const { user } = useAuth();
    const [interestedNeedIds, setInterestedNeedIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setInterestedNeedIds(new Set());
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const ids = await fetchUserInterests(user.id);
                setInterestedNeedIds(new Set(ids));
            } catch (err) {
                console.error('Failed to load interests:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const isInterested = useCallback((needId) => {
        return interestedNeedIds.has(needId);
    }, [interestedNeedIds]);

    const toggleInterest = useCallback(async (needId) => {
        if (!user) return;
        const currently = interestedNeedIds.has(needId);

        // Optimistic update
        setInterestedNeedIds(prev => {
            const next = new Set(prev);
            if (currently) next.delete(needId);
            else next.add(needId);
            return next;
        });

        try {
            await toggleInterestService(user.id, needId, currently);
        } catch (err) {
            // Revert on failure
            setInterestedNeedIds(prev => {
                const next = new Set(prev);
                if (currently) next.add(needId);
                else next.delete(needId);
                return next;
            });
            console.error('Failed to toggle interest:', err);
        }
    }, [user, interestedNeedIds]);

    return (
        <InterestContext.Provider value={{ isInterested, toggleInterest, loading }}>
            {children}
        </InterestContext.Provider>
    );
};

export const useInterest = () => useContext(InterestContext);

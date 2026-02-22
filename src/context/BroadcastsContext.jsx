import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    fetchUserBroadcasts,
    toggleBroadcast as toggleBroadcastApi,
} from '../lib/broadcastService';

const BroadcastsContext = createContext();

export const BroadcastsProvider = ({ children }) => {
    const { user } = useAuth();
    const [broadcastedNeedIds, setBroadcastedNeedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBroadcasts = async () => {
            if (!user) {
                setBroadcastedNeedIds([]);
                setLoading(false);
                return;
            }
            try {
                const ids = await fetchUserBroadcasts(user.id);
                setBroadcastedNeedIds(ids);
            } catch (err) {
                console.error('Failed to load user broadcasts:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBroadcasts();
    }, [user]);

    const isBroadcasted = useCallback(
        (needId) => broadcastedNeedIds.includes(needId),
        [broadcastedNeedIds]
    );

    const toggleBroadcast = async (needId) => {
        if (!user) {
            alert('Please sign in to broadcast posts.');
            return;
        }

        const currentlyBroadcasted = isBroadcasted(needId);

        // Optimistic UI update
        setBroadcastedNeedIds(prev =>
            currentlyBroadcasted
                ? prev.filter(id => id !== needId)
                : [...prev, needId]
        );

        try {
            await toggleBroadcastApi(user.id, needId, currentlyBroadcasted);
        } catch (err) {
            console.error('Failed to toggle broadcast:', err);
            // Revert on error
            setBroadcastedNeedIds(prev =>
                currentlyBroadcasted
                    ? [...prev, needId]
                    : prev.filter(id => id !== needId)
            );
            alert('Could not update broadcast. Please try again.');
        }
    };

    return (
        <BroadcastsContext.Provider value={{
            broadcastedNeedIds,
            isBroadcasted,
            toggleBroadcast,
            loadingBroadcasts: loading
        }}>
            {children}
        </BroadcastsContext.Provider>
    );
};

export const useBroadcasts = () => {
    const context = useContext(BroadcastsContext);
    if (!context) throw new Error('useBroadcasts must be used within a BroadcastsProvider');
    return context;
};

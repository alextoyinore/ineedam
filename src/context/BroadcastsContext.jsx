import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    fetchUserBroadcasts,
    toggleBroadcast as toggleBroadcastApi,
} from '../lib/broadcastService';

const BroadcastsContext = createContext();

export const BroadcastsProvider = ({ children }) => {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState([]); // [{id, type}, ...]
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBroadcasts = async () => {
            if (!user) {
                setBroadcasts([]);
                setLoading(false);
                return;
            }
            try {
                // fetchUserBroadcasts now returns array of IDs. 
                // However, our service currently doesn't easily distinguish them without another fetch or schema change info.
                // For now, let's just fetch everything and treat them as generic IDs, 
                // or better, update the service to return objects.
                const items = await fetchUserBroadcasts(user.id);
                // Since fetchUserBroadcasts currently returns a flat array of IDs, 
                // we'll treat them as generic. But to be safe, we'll store them as objects if we can.
                setBroadcasts(items.map(id => ({ id })));
            } catch (err) {
                console.error('Failed to load user broadcasts:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBroadcasts();
    }, [user]);

    const isBroadcasted = useCallback(
        (targetId, type = 'need') => broadcasts.some(b => b.id === targetId),
        [broadcasts]
    );

    const toggleBroadcast = async (targetId, type = 'need') => {
        if (!user) {
            alert('Please sign in to broadcast posts.');
            return;
        }

        const currentlyBroadcasted = isBroadcasted(targetId, type);

        // Optimistic UI update
        setBroadcasts(prev =>
            currentlyBroadcasted
                ? prev.filter(b => b.id !== targetId)
                : [...prev, { id: targetId, type }]
        );

        try {
            await toggleBroadcastApi(user.id, targetId, currentlyBroadcasted, type);
        } catch (err) {
            console.error('Failed to toggle broadcast:', err);
            // Revert on error
            setBroadcasts(prev =>
                currentlyBroadcasted
                    ? [...prev, { id: targetId, type }]
                    : prev.filter(b => b.id !== targetId)
            );
            alert('Could not update broadcast. Please try again.');
        }
    };

    return (
        <BroadcastsContext.Provider value={{
            broadcastedIds: broadcasts.map(b => b.id),
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

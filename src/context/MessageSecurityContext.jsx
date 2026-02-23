import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { hasPinSetup, verifyMessagePin, setupMessagePin } from '../lib/securityService';

const MessageSecurityContext = createContext();

export const useMessageSecurity = () => {
    return useContext(MessageSecurityContext);
};

export const MessageSecurityProvider = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const [isLocked, setIsLocked] = useState(true);
    const [hasPin, setHasPin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial load: check if the user has a PIN setup
    useEffect(() => {
        const checkPinStatus = async () => {
            if (user) {
                setLoading(true);
                const setup = await hasPinSetup(user.id);
                setHasPin(setup);
                setIsLocked(true); // Always start locked when session init
                setLoading(false);
            } else {
                setHasPin(false);
                setIsLocked(true);
                setLoading(false);
            }
        };

        checkPinStatus();
    }, [user]);

    // Route change listener: lock messages if navigating away from the messages routes
    useEffect(() => {
        if (!location.pathname.startsWith('/messages')) {
            setIsLocked(true);
        }
    }, [location.pathname]);

    const unlock = async (pin) => {
        if (!user) return false;
        const isValid = await verifyMessagePin(user.id, pin);
        if (isValid) {
            setIsLocked(false);
            return true;
        }
        return false;
    };

    const setup = async (pin) => {
        if (!user) return false;
        const success = await setupMessagePin(user.id, pin);
        if (success) {
            setHasPin(true);
            setIsLocked(false); // Automatically unlock after setup
            return true;
        }
        return false;
    };

    const lock = () => {
        setIsLocked(true);
    };

    const value = {
        isLocked,
        hasPinSetup: hasPin,
        loading,
        verifyPin: unlock,
        setupPin: setup,
        lockMessages: lock
    };

    return (
        <MessageSecurityContext.Provider value={value}>
            {children}
        </MessageSecurityContext.Provider>
    );
};

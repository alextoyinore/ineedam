import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { hasPinSetup, verifyMessagePin, setupMessagePin, removeMessagePin } from '../lib/securityService';

const ChatSecurityContext = createContext();

export const useChatSecurity = () => {
    return useContext(ChatSecurityContext);
};

export const ChatSecurityProvider = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const [isLocked, setIsLocked] = useState(true);
    const [hasPin, setHasPin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial load: check if the user has a PIN setup and session unlock status
    useEffect(() => {
        const checkPinStatus = async () => {
            if (user) {
                setLoading(true);
                const setup = await hasPinSetup(user.id);
                setHasPin(setup);
                
                // Check session storage for existing unlock
                const sessionUnlocked = sessionStorage.getItem(`chat_unlocked_${user.id}`) === 'true';
                
                if (setup && !sessionUnlocked) {
                    setIsLocked(true);
                } else {
                    setIsLocked(false);
                }
                
                setLoading(false);
            } else {
                setHasPin(false);
                setIsLocked(false);
                setLoading(false);
            }
        };

        checkPinStatus();
    }, [user]);

    // Route change listener: lock messages if navigating away from the messages routes
    useEffect(() => {
        if (!location.pathname.startsWith('/chat')) {
            if (hasPin) {
                setIsLocked(true);
            }
        }
    }, [location.pathname, hasPin]);

    const unlock = async (pin) => {
        if (!user) return false;
        const isValid = await verifyMessagePin(user.id, pin);
        if (isValid) {
            setIsLocked(false);
            sessionStorage.setItem(`chat_unlocked_${user.id}`, 'true');
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

    const clear = async () => {
        if (!user) return false;
        const success = await removeMessagePin(user.id);
        if (success) {
            setHasPin(false);
            setIsLocked(false); // Unlock immediately on deactivation
            return true;
        }
        return false;
    };

    const lock = () => {
        setIsLocked(true);
        if (user) {
            sessionStorage.removeItem(`chat_unlocked_${user.id}`);
        }
    };

    const value = {
        isLocked,
        hasPinSetup: hasPin,
        loading,
        verifyPin: unlock,
        setupPin: setup,
        clearPin: clear,
        lockMessages: lock
    };

    return (
        <ChatSecurityContext.Provider value={value}>
            {children}
        </ChatSecurityContext.Provider>
    );
};

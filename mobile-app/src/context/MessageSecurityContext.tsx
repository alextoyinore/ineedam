import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasPinSetup, verifyMessagePin, setupMessagePin as setPin } from '../services/securityService';
import { useAuth } from './AuthContext';

interface MessageSecurityContextType {
    isLocked: boolean;
    isPinSetup: boolean;
    unlock: (pin: string) => Promise<boolean>;
    setupPin: (pin: string) => Promise<boolean>;
    lock: () => void;
    checkPinStatus: () => Promise<void>;
}

const MessageSecurityContext = createContext<MessageSecurityContextType | null>(null);

export const MessageSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isLocked, setIsLocked] = useState(true);
    const [isPinSetup, setIsPinSetup] = useState(false);

    const checkPinStatus = async () => {
        if (user) {
            const setup = await hasPinSetup(user.id);
            setIsPinSetup(setup);
            if (!setup) {
                setIsLocked(false);
            } else {
                setIsLocked(true);
            }
        }
    };

    useEffect(() => {
        checkPinStatus();
    }, [user]);

    const unlock = async (pin: string) => {
        if (!user) return false;
        const success = await verifyMessagePin(user.id, pin);
        if (success) setIsLocked(false);
        return success;
    };

    const setupPin = async (pin: string) => {
        if (!user) return false;
        const success = await setPin(user.id, pin);
        if (success) {
            setIsPinSetup(true);
            setIsLocked(false);
        }
        return success;
    };

    const lock = () => setIsLocked(true);

    return (
        <MessageSecurityContext.Provider value={{
            isLocked, isPinSetup, unlock, setupPin, lock, checkPinStatus
        }}>
            {children}
        </MessageSecurityContext.Provider>
    );
};

export const useMessageSecurity = () => {
    const ctx = useContext(MessageSecurityContext);
    if (!ctx) throw new Error('useMessageSecurity must be used within MessageSecurityProvider');
    return ctx;
};

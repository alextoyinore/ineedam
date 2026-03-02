import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
    soundsEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    privateProfile: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSetting: (key: keyof Settings, value: any) => void;
    toggleSetting: (key: keyof Settings) => void;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
    soundsEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    theme: 'dark',
    privateProfile: false,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem('needam_settings');
                if (saved) {
                    setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        const saveSettings = async () => {
            try {
                await AsyncStorage.setItem('needam_settings', JSON.stringify(settings));
            } catch (err) {
                console.error('Failed to save settings:', err);
            }
        };
        if (!isLoading) saveSettings();
    }, [settings, isLoading]);

    const updateSetting = (key: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleSetting = (key: keyof Settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, toggleSetting, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};

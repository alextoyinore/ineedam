import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { setTheme } = useTheme();
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('needam_settings');
        return saved ? JSON.parse(saved) : {
            soundsEnabled: true,
            emailNotifications: true,
            pushNotifications: true,
            theme: 'system'
        };
    });

    useEffect(() => {
        localStorage.setItem('needam_settings', JSON.stringify(settings));
        if (settings.theme) {
            setTheme(settings.theme);
            // Also update app-theme key to stay in sync with ThemeContext's initializer
            localStorage.setItem('app-theme', settings.theme);
        }
    }, [settings, setTheme]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, toggleSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};

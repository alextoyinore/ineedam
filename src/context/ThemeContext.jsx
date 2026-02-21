import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check localStorage or default to 'system'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme || 'system';
    });

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (currentTheme) => {
            if (currentTheme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
            } else {
                root.setAttribute('data-theme', currentTheme);
            }
        };

        applyTheme(theme);
        localStorage.setItem('app-theme', theme);

        // Listen for system changes if set to system
        let mediaListener;
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaListener = (e) => {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', mediaListener);
        }

        return () => {
            if (mediaListener) {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaListener);
            }
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

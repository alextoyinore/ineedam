import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme || 'system';
    });

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (currentTheme) => {
            let resolvedTheme = currentTheme;
            if (currentTheme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                resolvedTheme = systemPrefersDark ? 'dark' : 'light';
            }

            root.setAttribute('data-theme', resolvedTheme);
            setIsDark(resolvedTheme === 'dark');
        };

        applyTheme(theme);
        localStorage.setItem('app-theme', theme);

        // Listen for system changes if set to system
        let mediaListener;
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaListener = (e) => {
                const resolvedTheme = e.matches ? 'dark' : 'light';
                root.setAttribute('data-theme', resolvedTheme);
                setIsDark(resolvedTheme === 'dark');
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
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

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
            
            // Update meta theme-color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
            }
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
                
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
                }
            };
            mediaQuery.addEventListener('change', mediaListener);
        }

        return () => {
            if (mediaListener) {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaListener);
            }
        };
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' || (prev === 'system' && isDark)) ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

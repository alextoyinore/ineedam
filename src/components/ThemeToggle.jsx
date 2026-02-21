import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: 'light', icon: <Sun size={18} />, label: 'Light' },
        { value: 'dark', icon: <Moon size={18} />, label: 'Dark' },
        { value: 'system', icon: <Laptop size={18} />, label: 'System' },
    ];

    return (
        <div style={{
            display: 'flex', padding: '0.25rem', borderRadius: '12px', gap: '0.25rem',
            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)'
        }}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        background: theme === opt.value ? 'var(--bg-base)' : 'transparent',
                        color: theme === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    title={opt.label}
                >
                    {opt.icon}
                </button>
            ))}
        </div>
    );
};

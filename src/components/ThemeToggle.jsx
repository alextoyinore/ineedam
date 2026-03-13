import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle = () => {
    const { theme } = useTheme();
    const { updateSetting } = useSettings();

    const options = [
        { value: 'light', icon: <Sun size={16} />, label: 'Light' },
        { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
        { value: 'system', icon: <Laptop size={16} />, label: 'Auto' },
    ];

    return (
        <div style={{
            display: 'flex', padding: '0.2rem', borderRadius: '10px', gap: '0.15rem',
            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)'
        }}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => updateSetting('theme', opt.value)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '7px',
                        background: theme === opt.value ? 'var(--bg-base)' : 'transparent',
                        color: theme === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: theme === opt.value ? 600 : 400,
                        whiteSpace: 'nowrap',
                    }}
                    title={opt.label}
                >
                    {opt.icon}
                    <span className="theme-toggle-label">{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

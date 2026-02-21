import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Volume2, VolumeX, Bell, Shield, Moon, Sun, Monitor, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
    const { settings, toggleSetting, updateSetting } = useSettings();
    const navigate = useNavigate();

    const sections = [
        {
            title: 'General',
            items: [
                {
                    id: 'soundsEnabled',
                    label: 'Sound Effects',
                    description: 'Play sounds for messages and notifications',
                    type: 'toggle',
                    icon: settings.soundsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />,
                    value: settings.soundsEnabled
                },
                {
                    id: 'theme',
                    label: 'Appearance',
                    description: 'Customize how Needam looks',
                    type: 'select',
                    icon: settings.theme === 'dark' ? <Moon size={20} /> : (settings.theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />),
                    options: [
                        { label: 'Light', value: 'light' },
                        { label: 'Dark', value: 'dark' },
                        { label: 'System', value: 'system' }
                    ],
                    value: settings.theme
                }
            ]
        },
        {
            title: 'Notifications',
            items: [
                {
                    id: 'pushNotifications',
                    label: 'Push Notifications',
                    description: 'Get alerts on your device',
                    type: 'toggle',
                    icon: <Bell size={20} />,
                    value: settings.pushNotifications
                }
            ]
        },
        {
            title: 'Account & Security',
            items: [
                {
                    id: 'privateProfile',
                    label: 'Private Profile',
                    description: 'Only followers can see your posts',
                    type: 'toggle',
                    icon: <Shield size={20} />,
                    value: settings.privateProfile
                }
            ]
        }
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="h1" style={{ margin: 0 }}>Settings</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {sections.map(section => (
                    <div key={section.title}>
                        <h2 className="h3" style={{ marginBottom: '1.25rem', color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {section.title}
                        </h2>
                        <div style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}>
                            {section.items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.25rem',
                                        borderBottom: idx === section.items.length - 1 ? 'none' : '1px solid var(--border-glass)'
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'var(--bg-base)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--primary)', flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>{item.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                    </div>

                                    {item.type === 'toggle' ? (
                                        <button
                                            onClick={() => toggleSetting(item.id)}
                                            style={{
                                                width: '48px', height: '26px', borderRadius: '13px',
                                                background: item.value ? 'var(--primary)' : 'var(--bg-base)',
                                                border: '1px solid var(--border-glass)', position: 'relative',
                                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '10px',
                                                background: 'white', position: 'absolute', top: '2px',
                                                left: item.value ? 'calc(100% - 22px)' : '2px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }} />
                                        </button>
                                    ) : (
                                        <select
                                            value={item.value}
                                            onChange={(e) => updateSetting(item.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '8px',
                                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                                color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            {item.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '1.5rem' }}>
                    <button
                        className="btn-outline"
                        style={{ color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
                                alert('In a real app, this would trigger an account deletion flow.');
                            }
                        }}
                    >
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Ineedam v1.0.4 • Made with love for the world.
                    </p>
                </div>
            </div>
        </div>
    );
};

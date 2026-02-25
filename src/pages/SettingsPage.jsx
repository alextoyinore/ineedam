import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
    Volume2, VolumeX, Bell, Shield, Moon, Sun, Monitor,
    ArrowLeft, Trash2, LogOut, Star, UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
    const { settings, toggleSetting, updateSetting } = useSettings();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

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
                    description: 'Customize how iNeedAm looks',
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
                },
                {
                    id: 'blockedAccounts',
                    label: 'Blocked Accounts',
                    description: 'Manage users you have blocked',
                    type: 'link',
                    path: '/blocked-accounts',
                    icon: <UserX size={20} />
                },
                {
                    id: 'archivedContent',
                    label: 'Archived Content',
                    description: 'View and restore archived posts and replies',
                    type: 'link',
                    path: '/settings/archived',
                    icon: <Trash2 size={20} />
                }
            ]
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Sticky Header — matches UserProfilePage & NeedDetailPage */}
            <header className="sticky-header" style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Settings</h2>
            </header>

            {/* Body */}
            <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem 6rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {sections.map(section => (
                    <div key={section.title}>
                        <h3 className="text-gradient" style={{
                            marginBottom: '0.75rem',
                            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', display: 'inline-block'
                        }}>
                            {section.title}
                        </h3>
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
                                        padding: '1rem 1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        borderBottom: idx === section.items.length - 1 ? 'none' : '1px solid var(--border-glass)'
                                    }}
                                >
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                    </div>

                                    {item.type === 'link' ? (
                                        <button
                                            onClick={() => navigate(item.path)}
                                            style={{
                                                padding: '0.4rem 1rem', borderRadius: '8px',
                                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                                color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem'
                                            }}
                                            className="nav-link-hover"
                                        >
                                            View
                                        </button>
                                    ) : item.type === 'toggle' ? (
                                        <button
                                            onClick={() => toggleSetting(item.id)}
                                            style={{
                                                width: '48px', height: '26px', borderRadius: '13px',
                                                background: item.value ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-base)',
                                                border: '1px solid var(--border-glass)', position: 'relative',
                                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                flexShrink: 0
                                            }}
                                        >
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '10px',
                                                background: 'white', position: 'absolute', top: '2px',
                                                left: item.value ? 'calc(100% - 22px)' : '2px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: 'none'
                                            }} />
                                        </button>
                                    ) : (
                                        <select
                                            value={item.value}
                                            onChange={(e) => updateSetting(item.id, e.target.value)}
                                            style={{
                                                padding: '0.4rem 0.75rem', borderRadius: '8px',
                                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                                color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
                                                fontSize: '0.9rem'
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

                {/* Premium Teaser */}
                <div>
                    <h3 className="text-gradient" style={{
                        marginBottom: '0.75rem',
                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', display: 'inline-block'
                    }}>
                        Upgrade
                    </h3>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', overflow: 'hidden' }}>
                        <button
                            onClick={() => navigate('/premium')}
                            style={{
                                width: '100%', padding: '1rem 1.25rem', display: 'flex',
                                alignItems: 'center', gap: '1rem', cursor: 'pointer',
                                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                textAlign: 'left'
                            }}
                            className="nav-link-hover"
                        >
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                boxShadow: 'none'
                            }}>
                                <Star size={20} color="white" fill="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>iNeedAm Premium</p>
                                    <span style={{ fontSize: '0.65rem', background: 'var(--accent)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 800 }}>NEW</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unlock exclusive features and stand out</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Logout + Danger Zone */}
                <div>
                    <h3 className="text-gradient" style={{
                        marginBottom: '0.75rem',
                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', display: 'inline-block'
                    }}>
                        Session
                    </h3>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', overflow: 'hidden' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%', padding: '1rem 1.25rem', display: 'flex',
                                alignItems: 'center', gap: '1rem', cursor: 'pointer',
                                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                textAlign: 'left', borderBottom: '1px solid var(--border-glass)'
                            }}
                            className="nav-link-hover"
                        >
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <LogOut size={20} color="#ef4444" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#ef4444' }}>Log Out</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sign out of your account</p>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure? This action is permanent and cannot be undone.')) {
                                    alert('Account deletion flow would be triggered here.');
                                }
                            }}
                            style={{
                                width: '100%', padding: '1rem 1.25rem', display: 'flex',
                                alignItems: 'center', gap: '1rem', cursor: 'pointer',
                                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                                textAlign: 'left'
                            }}
                            className="nav-link-hover"
                        >
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Trash2 size={20} color="#ef4444" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#ef4444' }}>Delete Account</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanently remove your account and data</p>
                            </div>
                        </button>
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    iNeedAm v1.0.4 · Made with love for the world.
                </p>
            </div>
        </div>
    );
};

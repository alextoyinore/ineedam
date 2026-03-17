import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
    Volume2, VolumeX, Bell, Shield, Moon, Sun, Monitor,
    ArrowLeft, Trash2, LogOut, Star, UserX, Mail, Newspaper, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatSecurity } from '../context/ChatSecurityContext';
import { ChatPinSetupModal } from '../components/ChatPinSetupModal';
import { ChatPinVerifyModal } from '../components/ChatPinVerifyModal';
import packageInfo from '../../package.json';

export const SettingsPage = () => {
    const { settings, toggleSetting, updateSetting } = useSettings();
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
    const { hasPinSetup, clearPin } = useChatSecurity();
    const [isPinSetupModalOpen, setIsPinSetupModalOpen] = useState(false);
    const [isPinVerifyModalOpen, setIsPinVerifyModalOpen] = useState(false);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    const [savingEmailPref, setSavingEmailPref] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
    const [savingNewsletter, setSavingNewsletter] = useState(false);

    // Sync email notifications preference from profile
    useEffect(() => {
        if (profile?.email_notifications_enabled !== undefined) {
            setEmailNotificationsEnabled(profile.email_notifications_enabled);
        }
        if (profile?.newsletter_subscribed !== undefined) {
            setNewsletterSubscribed(profile.newsletter_subscribed);
        }
    }, [profile?.email_notifications_enabled, profile?.newsletter_subscribed]);

    const handleEmailNotificationsToggle = async () => {
        const newValue = !emailNotificationsEnabled;
        setEmailNotificationsEnabled(newValue);
        setSavingEmailPref(true);
        try {
            await supabase
                .from('profiles')
                .update({ email_notifications_enabled: newValue })
                .eq('id', profile.id);
        } catch (err) {
            console.error('Failed to update email notification preference:', err);
            setEmailNotificationsEnabled(!newValue);
        } finally {
            setSavingEmailPref(false);
        }
    };

    const handleNewsletterToggle = async () => {
        const newValue = !newsletterSubscribed;
        setNewsletterSubscribed(newValue);
        setSavingNewsletter(true);
        try {
            await supabase
                .from('profiles')
                .update({ newsletter_subscribed: newValue })
                .eq('id', profile.id);
        } catch (err) {
            console.error('Failed to update newsletter preference:', err);
            setNewsletterSubscribed(!newValue);
        } finally {
            setSavingNewsletter(false);
        }
    };

    // Sync state for toggle
    const handlePinToggle = async () => {
        if (hasPinSetup) {
            setIsPinVerifyModalOpen(true);
        } else {
            setIsPinSetupModalOpen(true);
        }
    };

    const handleConfirmDeactivation = async () => {
        const success = await clearPin();
        if (success) {
            alert('Chat PIN deactivated successfully.');
        } else {
            alert('Failed to deactivate message PIN.');
        }
    };

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
                    description: 'Play sounds for chats and notifications',
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
                },
                {
                    id: 'emailNotifications',
                    label: 'Email Notifications',
                    description: 'Receive emails about follower activity, replies & endorsements',
                    type: 'toggle',
                    icon: <Mail size={20} />,
                    value: emailNotificationsEnabled,
                    customToggle: handleEmailNotificationsToggle,
                    disabled: savingEmailPref
                },
                {
                    id: 'newsletter',
                    label: 'Ineedam Newsletter',
                    description: 'High-value need alerts & platform updates',
                    type: 'toggle',
                    icon: <Newspaper size={20} />,
                    value: newsletterSubscribed,
                    customToggle: handleNewsletterToggle,
                    disabled: savingNewsletter
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
                },
                {
                    id: 'kycVerification',
                    label: 'Identity Verification (KYC)',
                    description: profile?.kyc_status === 'verified' 
                        ? 'Your identity is verified. Verified users get a trust badge.' 
                        : (profile?.kyc_status === 'pending' 
                            ? 'Verification is pending. We will notify you once approved.' 
                            : (localStorage.getItem(`kyc_draft_${profile?.id}`) 
                                ? 'Verification in progress — click to continue.' 
                                : 'Verify your identity to post in restricted categories.')),
                    type: 'link',
                    path: '/settings/kyc',
                    icon: <UserCheck size={20} />
                },
                {
                    id: 'messagePinLock',
                    label: 'Chat PIN Lock',
                    description: 'Require a 4-digit PIN to access private chats',
                    type: 'toggle',
                    icon: <Shield size={20} />,
                    value: hasPinSetup,
                    customToggle: handlePinToggle
                }
            ]
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ChatPinSetupModal
                isOpen={isPinSetupModalOpen}
                onClose={() => setIsPinSetupModalOpen(false)}
            />
            <ChatPinVerifyModal
                isOpen={isPinVerifyModalOpen}
                onClose={() => setIsPinVerifyModalOpen(false)}
                onSuccess={handleConfirmDeactivation}
            />
            {/* Sticky Header — matches UserProfilePage & NeedDetailPage */}
            <header className="sticky-header" style={{
                padding: '0.6rem var(--feed-item-padding)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', marginLeft: '-0.5rem' }}
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
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.05))',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'var(--primary)', opacity: 0.8, flexShrink: 0
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
                                            onClick={() => item.customToggle ? item.customToggle() : toggleSetting(item.id)}
                                            style={{
                                                width: '48px', height: '26px', borderRadius: '13px',
                                                background: item.value ? 'var(--primary)' : 'var(--bg-base)',
                                                opacity: item.value ? 0.85 : 1,
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
                                    ) : item.type === 'select' ? (
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
                                    ) : (
                                        <button
                                            onClick={item.action}
                                            style={{
                                                padding: '0.4rem 1rem', borderRadius: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                                            }}
                                            className="nav-link-hover"
                                        >
                                            Deactivate
                                        </button>
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
                    iNeedAm v{packageInfo.version} · Made with love for the world.
                </p>
            </div>
        </div>
    );
};

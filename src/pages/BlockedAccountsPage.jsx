import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserX, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBlockedUsers, unblockUser } from '../lib/moderationService';

export const BlockedAccountsPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlocked = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const data = await getBlockedUsers(currentUser.id);
                setBlockedUsers(data || []);
            } catch (err) {
                console.error("Failed to load blocked users", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            loadBlocked();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const handleUnblock = async (blockedId) => {
        if (!currentUser) return;
        try {
            await unblockUser(currentUser.id, blockedId);
            setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
        } catch (err) {
            console.error('Failed to unblock user:', err);
            alert('Could not unblock user.');
        }
    };

    if (!currentUser) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Please sign in to view this page.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            {/* Header */}
            <header className="sticky-header" style={{
                padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }}
                    className="glass-panel-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="h2" style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserX size={20} color="var(--primary)" /> Blocked Accounts
                </h1>
            </header>

            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Blocked users cannot see your profile, your posts, or send you messages. They will not be explicitly notified that you blocked them.
                </p>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--primary)' }}>
                        <Loader className="animate-spin" size={24} />
                    </div>
                ) : blockedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                        <UserX size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <h3 className="h3">No blocked accounts</h3>
                        <p>When you block someone, they will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {blockedUsers.map(user => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                    borderRadius: '16px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                        background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'var(--bg-base)',
                                        border: '1px solid var(--border-glass)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>
                                        {!user.avatar_url && user.display_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{user.display_name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>@{user.username}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnblock(user.id)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '9999px', color: '#ef4444' }}
                                >
                                    Unblock
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

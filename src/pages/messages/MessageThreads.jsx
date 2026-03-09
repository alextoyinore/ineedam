import React, { useState, useEffect, useMemo } from 'react';
import { Search, MailPlus, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../context/MessagesContext';
import { useAuth } from '../../context/AuthContext';
import { searchProfiles } from '../../lib/profileService';
import { getOrCreateThread } from '../../lib/messageService';

export const MessageThreads = () => {
    const { threads, startChat } = useMessages();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [threadSearch, setThreadSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingLoading, setIsSearchingLoading] = useState(false);

    // Filtered threads for the main list
    const filteredThreads = useMemo(() => {
        if (!threadSearch.trim()) return threads;
        const q = threadSearch.toLowerCase();
        return threads.filter(t =>
            t.withUser?.toLowerCase().includes(q) ||
            t.withUserUsername?.toLowerCase().includes(q)
        );
    }, [threads, threadSearch]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingLoading(true);
            try {
                const results = await searchProfiles(searchQuery);
                // Filter out current user
                setSearchResults(results.filter(p => p.id !== user?.id));
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearchingLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user]);

    const handleStartChat = async (targetUserId) => {
        if (!user) return;
        try {
            const threadId = await startChat(targetUserId);
            setIsSearching(false);
            setSearchQuery('');
            navigate(`/messages/${threadId}`);
        } catch (err) {
            console.error("Failed to start chat:", err);
            alert("Could not start a conversation. This usually happens if the server permissions are not set yet.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', width: '100%' }}>
            <header style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-glass)',
                position: 'sticky',
                top: 'var(--sticky-offset, 0px)',
                background: 'var(--bg-base)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className="h2" style={{ fontSize: '1.5rem', margin: 0 }}>Messages</h2>
                    <button
                        onClick={() => setIsSearching(true)}
                        style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            color: 'var(--primary)', padding: '0.5rem', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <MailPlus size={20} />
                    </button>
                </div>
                {!isSearching ? (
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search messages"
                            value={threadSearch}
                            onChange={(e) => setThreadSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '9999px',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                color: 'var(--text-primary)', fontSize: '0.9rem'
                            }}
                        />
                        {threadSearch && (
                            <button
                                onClick={() => setThreadSearch('')}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search people... (use @ for username)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '0.5rem 3rem 0.5rem 1rem', borderRadius: '9999px',
                                background: 'transparent', border: '1px solid var(--primary)',
                                color: 'var(--text-primary)', fontSize: '0.9rem'
                            }}
                        />
                        <button
                            onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </header>

            <div style={{ flex: 1 }}>
                {isSearching ? (
                    <div style={{ padding: '1rem' }}>
                        {isSearchingLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(profile => (
                                <div
                                    key={profile.id}
                                    onClick={() => handleStartChat(profile.id)}
                                    className="feed-item-hover"
                                    style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderRadius: '12px' }}
                                >
                                    <div className="avatar-md" style={{
                                        borderRadius: '50%', flexShrink: 0,
                                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                                        border: '1px solid var(--border-glass)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', overflow: 'hidden'
                                    }}>
                                        {!profile.avatar_url && (profile.display_name?.charAt(0) || '?')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{profile.display_name}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>@{profile.username}</p>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery.trim() ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found for "{searchQuery}"</p>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Search for users to start chatting</p>
                        )}
                    </div>
                ) : filteredThreads.length > 0 ? (
                    filteredThreads.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => navigate(`/messages/${thread.id}`)}
                            className="feed-item-hover"
                            style={{
                                padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center',
                                cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                position: 'relative'
                            }}
                        >
                            {thread.unread && (
                                <div style={{ position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                            )}
                            <div className="avatar-lg" style={{
                                borderRadius: '50%', flexShrink: 0,
                                background: thread.withUserAvatar ? `url(${thread.withUserAvatar}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white',
                                overflow: 'hidden'
                            }}>
                                {!thread.withUserAvatar && (thread.withUser?.charAt(0) || '?')}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{thread.withUser}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p style={{
                                    margin: 0, fontSize: '0.85rem', color: thread.unread ? 'var(--text-primary)' : 'var(--text-muted)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    fontWeight: thread.unread ? 600 : 400
                                }}>
                                    {thread.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        {threadSearch ? `No conversations found for "${threadSearch}"` : "No messages yet."}
                    </p>
                )}
            </div>
        </div>
    );
};

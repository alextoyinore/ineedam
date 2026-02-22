import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { getSuggestedProfiles } from '../lib/profileService';

export const MobileWhoToFollowPage = () => {
    const { user } = useAuth();
    const { toggleFollow, isFollowing } = useSocial();
    const navigate = useNavigate();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuggestedUsers = async () => {
            if (!user) return;
            try {
                // Fetch more than the right sidebar to give mobile users a scrolling list
                const users = await getSuggestedProfiles(user.id, 15);
                setSuggestedUsers(users);
            } catch (err) {
                console.error("Failed to load suggested users", err);
            } finally {
                setLoading(false);
            }
        };
        loadSuggestedUsers();
    }, [user]);

    const handleFollowClick = async (e, userId) => {
        e.stopPropagation(); // prevent navigation to profile
        await toggleFollow(userId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
            <header className="sticky-header" style={{
                padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 className="h2" style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} color="var(--primary)" /> Who to follow
                </h2>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--primary)' }}>
                        <Loader size={32} className="animate-spin" />
                    </div>
                ) : suggestedUsers.length > 0 ? (
                    suggestedUsers.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => navigate(`/${profile.username}`)}
                            style={{
                                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                                display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'
                            }}
                            className="nav-link-hover"
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white'
                            }}>
                                {!profile.avatar_url && profile.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.display_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{profile.username}</div>
                                    </div>
                                </div>
                                {profile.bio && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.bio}</p>}
                            </div>
                            <button
                                onClick={(e) => handleFollowClick(e, profile.id)}
                                className={isFollowing(profile.id) ? "btn btn-secondary" : "btn btn-primary"}
                                style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}
                            >
                                {isFollowing(profile.id) ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <h3 className="h3">No suggestions</h3>
                        <p>Check back later for more people to follow.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

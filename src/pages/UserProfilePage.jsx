import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Users, Mail, UserPlus, UserMinus,
    ShieldCheck, Edit3, CheckCircle, Trash2, Settings, Repeat2, Loader
} from 'lucide-react';

import { NeedCard } from '../components/NeedCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { EditNeedModal } from '../components/EditNeedModal';
import { MarkMetModal } from '../components/MarkMetModal';
import { EndorseModal } from '../components/EndorseModal';

import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { getProfileByUsername } from '../lib/profileService';
import {
    fetchNeedsByUser, shapeNeed, fetchMetCounts,
    updateNeedStatus, updateNeed
} from '../lib/needsService';
import { getFollowStats, getFollowers, getFollowing } from '../lib/socialService';
import { fetchRepliesByUser, formatTimeAgo } from '../lib/replyService';
import { getOrCreateThread } from '../lib/messageService';
import { fetchBroadcastedNeeds } from '../lib/broadcastService';
import { fetchEndorsementsForUser } from '../lib/endorsementService';

export const UserProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { profile: loggedInProfile, user: currentUser } = useAuth();
    const { following, toggleFollow } = useSocial();

    // Profile State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('needs');

    // Data State
    const [userNeeds, setUserNeeds] = useState([]);
    const [userReplies, setUserReplies] = useState([]);
    const [userBroadcasts, setUserBroadcasts] = useState([]);
    const [userEndorsements, setUserEndorsements] = useState([]);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [stats, setStats] = useState({
        needsMet: 0,
        fulfilledRequests: 0,
        followersCount: 0,
        followingCount: 0
    });

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNeedEditModalOpen, setIsNeedEditModalOpen] = useState(false);
    const [isMarkMetModalOpen, setIsMarkMetModalOpen] = useState(false);
    const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [needToEndorse, setNeedToEndorse] = useState(null);

    const isOwnProfile = currentUser?.id === profile?.id;
    const isFollowing = profile && following.includes(profile.id);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setLoadingData(true);
            try {
                const profileData = await getProfileByUsername(username);
                if (!profileData) {
                    setProfile(null);
                    setLoading(false);
                    return;
                }
                setProfile(profileData);

                // Load needs, replies and stats
                const [needsData, repliesData, broadcastsData, metStats, followStats, endorsementsData, followersData, followingData] = await Promise.all([
                    fetchNeedsByUser(profileData.id),
                    fetchRepliesByUser(profileData.id),
                    fetchBroadcastedNeeds(profileData.id),
                    fetchMetCounts(profileData.id),
                    getFollowStats(profileData.id),
                    fetchEndorsementsForUser(profileData.id),
                    getFollowers(profileData.id),
                    getFollowing(profileData.id)
                ]);

                setUserNeeds(needsData ? needsData.map(shapeNeed) : []);
                setUserReplies(repliesData || []);
                setUserBroadcasts(broadcastsData ? broadcastsData.map(shapeNeed) : []);
                setUserEndorsements(endorsementsData || []);
                setFollowersList(followersData || []);
                setFollowingList(followingData || []);
                setStats({ ...metStats, ...followStats });
            } catch (err) {
                console.error("Error loading profile page:", err);
            } finally {
                setLoading(false);
                setLoadingData(false);
            }
        };

        if (username) {
            loadProfile();
        }
    }, [username]);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
    };

    const handleMessage = async () => {
        if (!currentUser) {
            alert("Please sign in to send messages.");
            return;
        }
        try {
            const threadId = await getOrCreateThread(currentUser.id, profile.id);
            navigate(`/messages/${threadId}`);
        } catch (err) {
            console.error("Failed to start conversation:", err);
            alert("Could not start a conversation. Please try again later.");
        }
    };

    const handleMarkMet = (need) => {
        setSelectedNeed(need);
        setIsMarkMetModalOpen(true);
    };

    const handleConfirmMet = async (needId, helperProfile) => {
        try {
            await updateNeedStatus(needId, 'met', helperProfile.id);
            // Refresh data
            const [needsData, metStats] = await Promise.all([
                fetchNeedsByUser(profile.id),
                fetchMetCounts(profile.id)
            ]);
            setUserNeeds(needsData ? needsData.map(shapeNeed) : []);
            setStats(prev => ({ ...prev, ...metStats }));

            setTimeout(() => {
                const needForEndorse = needsData?.find(n => n.id === needId) || selectedNeed;
                setNeedToEndorse({ ...needForEndorse, metByProfile: helperProfile });
                setIsEndorseModalOpen(true);
            }, 2100);

        } catch (err) {
            console.error("Failed to mark met:", err);
            throw err;
        }
    };

    const handleArchive = async (needId) => {
        if (!confirm("Are you sure you want to archive this need?")) return;
        try {
            await updateNeedStatus(needId, 'archived');
            const needsData = await fetchNeedsByUser(profile.id);
            setUserNeeds(needsData ? needsData.map(shapeNeed) : []);
        } catch (err) {
            console.error("Failed to archive:", err);
            alert("Error archiving need.");
        }
    };

    const handleEditUpdate = async (needId, updates) => {
        try {
            await updateNeed(needId, updates);
            const needsData = await fetchNeedsByUser(profile.id);
            setUserNeeds(needsData ? needsData.map(shapeNeed) : []);
        } catch (err) {
            console.error("Failed to update need:", err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
                <Loader size={32} className="animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 className="h2">Profile not found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The user you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentProfile={profile}
                onProfileUpdate={handleProfileUpdate}
            />

            <EditNeedModal
                isOpen={isNeedEditModalOpen}
                onClose={() => setIsNeedEditModalOpen(false)}
                need={selectedNeed}
                onUpdate={handleEditUpdate}
            />

            <MarkMetModal
                isOpen={isMarkMetModalOpen}
                onClose={() => setIsMarkMetModalOpen(false)}
                need={selectedNeed}
                onConfirm={handleConfirmMet}
            />

            <EndorseModal
                isOpen={isEndorseModalOpen}
                onClose={() => setIsEndorseModalOpen(false)}
                need={needToEndorse}
                onSuccess={async () => {
                    if (!profile) return;
                    const endorsementsData = await fetchEndorsementsForUser(profile.id);
                    setUserEndorsements(endorsementsData || []);
                }}
            />

            {/* Header */}
            <header className="sticky-header" style={{
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>
                        {profile.display_name}
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{userNeeds.length} posts</span>
                </div>
            </header>

            {/* Banner */}
            <div className="profile-banner" style={{
                background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                position: 'relative'
            }}>
                {/* Profile Completion Prompt (Owner Only) */}
                {isOwnProfile && (!profile.username || !profile.bio || !profile.location || !profile.avatar_url) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'absolute', bottom: '1rem', right: '1rem',
                            background: 'var(--bg-surface-glass)', backdropFilter: 'blur(10px)',
                            padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-glass)',
                            maxWidth: '240px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 700 }}>Complete your Profile</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {!profile.username && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={10} /> Set a username</span>}
                            {!profile.bio && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={10} /> Add a bio</span>}
                            {!profile.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={10} /> Set your location</span>}
                            {!profile.avatar_url && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={10} /> Upload an avatar</span>}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Profile Info */}
            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="profile-avatar" style={{
                        borderRadius: '50%',
                        background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                        border: '4px solid var(--bg-base)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'var(--text-primary)',
                        overflow: 'hidden'
                    }}>
                        {!profile.avatar_url && profile.display_name.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        {isOwnProfile ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button onClick={() => setIsEditModalOpen(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                                    Edit Profile
                                </button>
                                <button onClick={() => navigate('/settings')} style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', background: 'var(--bg-surface)', cursor: 'pointer' }} className="glass-panel-hover" title="Settings">
                                    <Settings size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleMessage}
                                    style={{
                                        padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border-glass)',
                                        color: 'var(--text-primary)', background: 'var(--bg-surface)', cursor: 'pointer'
                                    }}
                                    className="glass-panel-hover"
                                >
                                    <Mail size={20} />
                                </button>
                                <button
                                    onClick={() => toggleFollow(profile.id)}
                                    className={isFollowing ? "btn btn-secondary" : "btn btn-primary"}
                                    style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', fontWeight: 600, minWidth: '100px' }}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h1 className="h1" style={{ fontSize: '1.5rem', margin: 0 }}>{profile.display_name}</h1>
                        {profile.id === '31080433-1e29-4eee-9b6f-673b1e159802' && <ShieldCheck size={18} color="var(--primary)" />}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 1rem 0' }}>
                        @{profile.username}
                    </p>

                    {profile.bio && (
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                            {profile.bio}
                        </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {profile.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={16} /> {profile.location}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={16} /> Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>{stats.followingCount}</strong> Following</span>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>{stats.followersCount}</strong> Followers</span>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>{stats.needsMet}</strong> Given</span>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>{stats.fulfilledRequests}</strong> Received</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', overflowX: 'auto' }}>
                {['needs', 'broadcasts', 'endorsements', 'replies', 'following', 'followers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: '1rem', fontWeight: 600, fontSize: '0.9rem',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                            position: 'relative', transition: 'background-color 0.2s',
                            textTransform: 'capitalize', whiteSpace: 'nowrap'
                        }}
                        className="nav-link-hover"
                    >
                        {tab === 'needs' ? 'Posts' : tab}
                        {activeTab === tab && (
                            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '4px', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'needs' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : userNeeds.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No posts yet.</div>
                    ) : (
                        <div style={{ padding: '1rem 0' }}>
                            {userNeeds.map((need, idx) => (
                                <motion.div
                                    key={need.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{ borderBottom: '1px solid var(--border-glass)' }}
                                >
                                    <div style={{ padding: '0 1.5rem' }}>
                                        <NeedCard need={need} />
                                    </div>
                                    {isOwnProfile && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1.5rem', paddingLeft: '6rem' }}>
                                            {need.status !== 'met' && (
                                                <button onClick={() => { setSelectedNeed(need); setIsNeedEditModalOpen(true); }} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '9999px' }}>Edit</button>
                                            )}
                                            {need.status === 'open' && (
                                                <button onClick={() => handleMarkMet(need)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#10b981', borderRadius: '9999px' }}>Mark Met</button>
                                            )}
                                            {need.status === 'open' && (
                                                <button onClick={() => handleArchive(need.id)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderRadius: '9999px', marginLeft: 'auto', marginRight: '1.5rem' }}>Archive</button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'replies' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : userReplies.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No replies yet.</div>
                    ) : userReplies.map((reply, idx) => (
                        <div key={reply.id} className="nav-link-hover" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                {!profile.avatar_url && profile.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700 }}>{profile.display_name}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{profile.username}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Replying to need <span style={{ color: 'var(--primary)' }}>"{reply.needs?.title}"</span>
                                </p>
                                <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                            </div>
                        </div>
                    ))
                )}

                {activeTab === 'following' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : followingList.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 className="h3">Not following anyone</h3>
                            <p>When {isOwnProfile ? 'you follow' : `${profile.display_name} follows`} someone, they will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 0' }}>
                            {followingList.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/${user.username}`)}
                                    style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                        background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'var(--bg-surface)',
                                        border: '1px solid var(--border-glass)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-primary)', fontWeight: 'bold'
                                    }}>
                                        {!user.avatar_url && user.display_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{user.display_name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{user.username}</div>
                                            </div>
                                        </div>
                                        {user.bio && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.bio}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'followers' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : followersList.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 className="h3">No followers yet</h3>
                            <p>When people follow {isOwnProfile ? 'you' : profile.display_name}, they will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 0' }}>
                            {followersList.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/${user.username}`)}
                                    style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                    className="nav-link-hover"
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                        background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'var(--bg-surface)',
                                        border: '1px solid var(--border-glass)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-primary)', fontWeight: 'bold'
                                    }}>
                                        {!user.avatar_url && user.display_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{user.display_name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{user.username}</div>
                                            </div>
                                        </div>
                                        {user.bio && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.bio}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'broadcasts' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : userBroadcasts.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Repeat2 size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                            <h3 className="h3" style={{ marginBottom: '0.5rem' }}>No broadcasts yet</h3>
                            <p>When {isOwnProfile ? 'you broadcast' : `${profile.display_name} broadcasts`} a need, it will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 0' }}>
                            {userBroadcasts.map((need, idx) => (
                                <motion.div
                                    key={need.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border-glass)' }}
                                >
                                    {/* Broadcaster attribution label */}
                                    <div style={{ padding: '0.75rem 1.5rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                                        <Repeat2 size={14} />
                                        {profile.display_name} broadcasted
                                    </div>
                                    <div style={{ padding: '0 1.5rem' }}>
                                        <NeedCard need={need} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'endorsements' && (
                    loadingData ? (
                        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}><Loader size={24} className="animate-spin" /></div>
                    ) : userEndorsements.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No endorsements yet.</div>
                    ) : (
                        <div style={{ padding: '1rem 0' }}>
                            {userEndorsements.map((endorsement, idx) => (
                                <motion.div
                                    key={endorsement.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border-glass)', padding: '1.5rem' }}
                                >
                                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                            background: endorsement.profiles?.avatar_url ? `url(${endorsement.profiles.avatar_url}) center/cover` : 'var(--bg-surface)',
                                            border: '1px solid var(--border-glass)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem'
                                        }}>
                                            {!endorsement.profiles?.avatar_url && endorsement.profiles?.display_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{endorsement.profiles?.display_name}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{endorsement.profiles?.username}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>• {formatTimeAgo(endorsement.created_at)}</span>
                                            </div>
                                            <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>"{endorsement.message}"</p>

                                            <div style={{
                                                border: '1px solid var(--border-glass)', borderRadius: '12px',
                                                padding: '0.875rem 1rem', background: 'var(--bg-surface)'
                                            }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>For helping with</p>
                                                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{endorsement.needs?.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

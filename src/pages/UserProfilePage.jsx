import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Users, Mail, UserPlus, UserMinus,
    ShieldCheck, Edit3, CheckCircle, Trash2, Settings, Repeat2, Loader,
    MoreVertical, Flag, Ban
} from 'lucide-react';

import { NeedCard } from '../components/NeedCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { EditNeedModal } from '../components/EditNeedModal';
import { MarkMetModal } from '../components/MarkMetModal';
import { EndorseModal } from '../components/EndorseModal';
import { EndorsementFeedCard } from '../components/EndorsementFeedCard';
import { ReportModal } from '../components/ReportModal';

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
import { checkBlockStatus, blockUser, unblockUser } from '../lib/moderationService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const UserProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { profile: loggedInProfile, user: currentUser } = useAuth();
    const { following, toggleFollow } = useSocial();

    // Profile State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('needs');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [blockStatus, setBlockStatus] = useState({ hasBlocked: false, isBlockedBy: false });

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

    // Pagination for Needs
    const [needsPage, setNeedsPage] = useState(0);
    const [hasMoreNeeds, setHasMoreNeeds] = useState(true);
    const [loadingMoreNeeds, setLoadingMoreNeeds] = useState(false);
    const PAGE_SIZE = 10;

    // Modals State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNeedEditModalOpen, setIsNeedEditModalOpen] = useState(false);
    const [isMarkMetModalOpen, setIsMarkMetModalOpen] = useState(false);
    const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [needToEndorse, setNeedToEndorse] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
                const results = await Promise.allSettled([
                    fetchNeedsByUser(profileData.id),
                    fetchRepliesByUser(profileData.id),
                    fetchBroadcastedNeeds(profileData.id),
                    fetchMetCounts(profileData.id),
                    getFollowStats(profileData.id),
                    fetchEndorsementsForUser(profileData.id),
                    getFollowers(profileData.id),
                    getFollowing(profileData.id)
                ]);

                const needsData = results[0].status === 'fulfilled' ? results[0].value : [];
                const repliesData = results[1].status === 'fulfilled' ? results[1].value : [];
                const broadcastsData = results[2].status === 'fulfilled' ? results[2].value : [];
                const metStats = results[3].status === 'fulfilled' ? results[3].value : { needsMet: 0, fulfilledRequests: 0 };
                const followStats = results[4].status === 'fulfilled' ? results[4].value : { followersCount: 0, followingCount: 0 };
                const endorsementsData = results[5].status === 'fulfilled' ? results[5].value : [];
                const followersData = results[6].status === 'fulfilled' ? results[6].value : [];
                const followingData = results[7].status === 'fulfilled' ? results[7].value : [];

                const shapedNeeds = (needsData || [])
                    .filter(n => n.status !== 'archived')
                    .map(shapeNeed)
                    .map(n => ({ ...n, type: 'need' }));

                const filteredReplies = (repliesData || []).filter(r => r.status !== 'archived');
                const shapedBroadcasts = broadcastsData || [];
                const shapedEndorsements = (endorsementsData || []).map(e => ({ ...e, type: 'endorsement' }));
                const shapedReplies = (filteredReplies || []).map(r => ({ ...r, type: 'reply' }));

                const mixedFeed = [...shapedNeeds, ...shapedEndorsements, ...shapedReplies, ...shapedBroadcasts]
                    .filter(item => item && (item.created_at || item.broadcast_created_at))
                    .sort((a, b) => {
                        const timeA = new Date(a.broadcast_created_at || a.created_at).getTime();
                        const timeB = new Date(b.broadcast_created_at || b.created_at).getTime();
                        return timeB - timeA;
                    });

                setUserNeeds(mixedFeed); // Now userNeeds holds the mixed feed
                setNeedsPage(1);
                setHasMoreNeeds(mixedFeed.length >= PAGE_SIZE); // Check based on mixed feed length
                setUserReplies(filteredReplies);
                setUserBroadcasts(shapedBroadcasts); // Keep for the specific tab if still needed
                setUserEndorsements(endorsementsData || []);
                setFollowersList(followersData || []);
                setFollowingList(followingData || []);
                setStats({ ...metStats, ...followStats });

                if (currentUser && currentUser.id !== profileData.id) {
                    const blockInfo = await checkBlockStatus(currentUser.id, profileData.id);
                    setBlockStatus(blockInfo);
                }
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

    const handleToggleBlock = async () => {
        if (!currentUser) return;
        setIsMenuOpen(false);
        try {
            if (blockStatus.hasBlocked) {
                await unblockUser(currentUser.id, profile.id);
                setBlockStatus(prev => ({ ...prev, hasBlocked: false }));
            } else {
                if (window.confirm(`Are you sure you want to block ${profile.display_name}? They will no longer be able to message or interact with you.`)) {
                    await blockUser(currentUser.id, profile.id);
                    setBlockStatus(prev => ({ ...prev, hasBlocked: true }));
                    // If following, maybe optimistically unfollow too (complex here, keeping simple)
                }
            }
        } catch (err) {
            console.error('Failed to toggle block status:', err);
            alert('Failed to update block status.');
        }
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

    const loadMoreNeeds = useCallback(async () => {
        if (!profile || !hasMoreNeeds || loadingMoreNeeds) return;

        setLoadingMoreNeeds(true);
        try {
            const from = needsPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            const moreNeeds = await fetchNeedsByUser(profile.id, from, to);

            if (moreNeeds && moreNeeds.length > 0) {
                setUserNeeds(prev => [...prev, ...moreNeeds.map(shapeNeed)]);
                setNeedsPage(prev => prev + 1);
            }

            if (!moreNeeds || moreNeeds.length < PAGE_SIZE) {
                setHasMoreNeeds(false);
            }
        } catch (err) {
            console.error("Error loading more needs:", err);
        } finally {
            setLoadingMoreNeeds(false);
        }
    }, [profile, hasMoreNeeds, loadingMoreNeeds, needsPage]);

    const lastNeedRef = useInfiniteScroll(loadMoreNeeds, hasMoreNeeds, loadingData || loadingMoreNeeds);

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

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                reportedProfile={profile}
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

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        style={{
                                            padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border-glass)',
                                            color: 'var(--text-primary)', background: 'var(--bg-surface)', cursor: 'pointer'
                                        }}
                                        className="glass-panel-hover"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <>
                                                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setIsMenuOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    style={{
                                                        position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 100,
                                                        background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                                                        border: '1px solid var(--border-glass)', borderRadius: '12px',
                                                        padding: '0.5rem', minWidth: '160px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => { setIsMenuOpen(false); setIsReportModalOpen(true); }}
                                                        style={{
                                                            width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                            background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                                                            textAlign: 'left', borderRadius: '8px'
                                                        }}
                                                        className="nav-link-hover"
                                                    >
                                                        <Flag size={16} /> Report User
                                                    </button>
                                                    <button
                                                        onClick={handleToggleBlock}
                                                        style={{
                                                            width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                            background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer',
                                                            textAlign: 'left', borderRadius: '8px'
                                                        }}
                                                        className="nav-link-hover"
                                                    >
                                                        <Ban size={16} /> {blockStatus.hasBlocked ? 'Unblock User' : 'Block User'}
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
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

            {/* Block Overlays */}
            {blockStatus.isBlockedBy ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Ban size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 className="h3">You cannot view this profile</h3>
                    <p>This user has restricted who can see their content.</p>
                </div>
            ) : blockStatus.hasBlocked ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Ban size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 className="h3">You blocked this user</h3>
                    <p>You must unblock them to see their content.</p>
                    <button onClick={handleToggleBlock} className="btn btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '9999px' }}>
                        Unblock
                    </button>
                </div>
            ) : (
                <>
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
                                    {userNeeds.map((item, idx) => {
                                        const isOwnItem = isOwnProfile && item.type === 'need' && item.authorId === profile.id;

                                        return (
                                            <motion.div
                                                key={`${item.type}-${item.id}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                {item.type === 'need' || item.type === 'broadcast' ? (
                                                    <NeedCard
                                                        need={item}
                                                        broadcastedBy={item.type === 'broadcast' ? item.broadcasted_by : null}
                                                    />
                                                ) : item.type === 'endorsement' || item.type === 'broadcast_endorsement' ? (
                                                    <EndorsementFeedCard
                                                        endorsement={item}
                                                        broadcastedBy={item.type === 'broadcast_endorsement' ? item.broadcasted_by : null}
                                                    />
                                                ) : item.type === 'reply' ? (
                                                    <div className="nav-link-hover" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '1rem' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                                            background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--bg-surface)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden'
                                                        }}>
                                                            {profile.avatar_url ? (
                                                                <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                (profile.display_name || '?').charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 700 }}>{profile.display_name}</span>
                                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{profile.username}</span>
                                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(item.created_at)}</span>
                                                            </div>
                                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                                Replying to <span style={{ color: 'var(--primary)' }}>"{item.needs?.title}"</span>
                                                            </p>
                                                            <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {isOwnItem && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1.5rem', paddingLeft: '6rem' }}>
                                                        {item.status !== 'met' && (
                                                            <button onClick={() => { setSelectedNeed(item); setIsNeedEditModalOpen(true); }} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '9999px' }}>Edit</button>
                                                        )}
                                                        {item.status === 'open' && (
                                                            <button onClick={() => handleMarkMet(item)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#10b981', borderRadius: '9999px' }}>Mark Met</button>
                                                        )}
                                                        {item.status === 'open' && (
                                                            <button onClick={() => handleArchive(item.id)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderRadius: '9999px', marginLeft: 'auto', marginRight: '1.5rem' }}>Archive</button>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={lastNeedRef} style={{ height: '20px' }} />
                                    {loadingMoreNeeds && (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'var(--primary)' }}>
                                            <Loader size={24} className="animate-spin" />
                                        </div>
                                    )}
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
                                            className="card-hover"
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
                                        >
                                            <NeedCard need={need} broadcastedBy={profile} />
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
                                    {userEndorsements.map((endorsement, idx) => {
                                        // Map the UserProfilePage's endorsement shape to the one expected by EndorsementFeedCard
                                        const mappedEndorsement = {
                                            ...endorsement,
                                            endorser: endorsement.profiles,
                                            endorsed: profile
                                        };

                                        return (
                                            <motion.div
                                                key={endorsement.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <EndorsementFeedCard endorsement={mappedEndorsement} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

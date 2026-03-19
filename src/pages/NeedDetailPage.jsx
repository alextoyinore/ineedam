import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Lock, Globe, MessageSquare, Archive, Paperclip, FileText, Download, X, Image, Heart, Share2, Bookmark, Repeat2, ShieldCheck, MoreVertical, Flag, Trash2 } from 'lucide-react';
import { ImageLightbox } from '../components/ImageLightbox';
import { OnlineBadge } from '../components/OnlineBadge';
import { NeedCard } from '../components/NeedCard';
import { getNeedById, shapeNeed, uploadFileToCloudinary, uploadImageToCloudinary, updateNeed, updateNeedStatus } from '../lib/needsService';
import { fetchRepliesForNeed, createReply, formatTimeAgo, updateReplyStatus, getFirstReplyTime, formatResponseTime, getReplyCount } from '../lib/replyService';
import { getLikeCount } from '../lib/likesService';
import { getBroadcastCount } from '../lib/broadcastService';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useBroadcasts } from '../context/BroadcastsContext';
import { ProfileHoverCard } from '../components/ProfileHoverCard';
import { ReplyModal } from '../components/ReplyModal';
import { AttachmentModal } from '../components/AttachmentModal';
import { MentionText } from '../components/MentionText';
import { EditNeedModal } from '../components/EditNeedModal';
import { MarkMetModal } from '../components/MarkMetModal';
import { EndorseModal } from '../components/EndorseModal';
import { Helmet } from 'react-helmet-async';
import { formatDisplayName, formatUsername } from '../lib/profileService';
import { useLinkPreview } from '../hooks/useLinkPreview';
import { LinkPreviewCard } from '../components/LinkPreviewCard';
import { SendNeedToChat } from '../components/SendNeedToChat';

const ReplyItem = ({ reply, need, depth = 0, onReply, onArchive, onViewAttachment, isMobile }) => {
    const { user } = useAuth();
    const isMe = user && reply.user_id === user.id;
    const authorName = reply.profiles?.display_name || 'Anonymous';
    const authorUsername = reply.profiles?.username;
    const authorAvatar = reply.profiles?.avatar_url;

    const { preview } = useLinkPreview(reply.content);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSendToChatOpen, setIsSendToChatOpen] = useState(false);

    return (
        <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? '2px solid var(--border-glass)' : 'none' }}>
            <div
                className="feed-item-hover"
                style={{
                    padding: '1rem var(--feed-item-padding)',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    marginLeft: isMobile ? '' : 0
                }}
            >
                <ProfileHoverCard userData={{
                    id: reply.user_id,
                    author: authorName,
                    authorUsername: authorUsername,
                    authorAvatar: authorAvatar,
                    authorBio: reply.profiles?.bio,
                    authorLastSeenAt: reply.profiles?.last_seen_at,
                    kycStatus: reply.profiles?.kyc_status
                }}>
                    <div className="avatar-md" style={{
                        borderRadius: '50%', flexShrink: 0,
                        background: authorAvatar ? `url(${authorAvatar}) center / cover` : (isMe ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)'),
                        border: (isMe || authorAvatar) ? 'none' : '1px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: isMe ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer', position: 'relative'
                    }}>
                        {!authorAvatar && authorName.charAt(0).toUpperCase()}
                        <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                            <OnlineBadge lastSeenAt={reply.profiles?.last_seen_at} size="12px" />
                        </div>
                    </div>
                </ProfileHoverCard>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <ProfileHoverCard userData={{
                            id: reply.user_id,
                            author: authorName,
                            authorUsername: authorUsername,
                            authorAvatar: authorAvatar,
                            authorBio: reply.profiles?.bio,
                            authorLastSeenAt: reply.profiles?.last_seen_at,
                            kycStatus: reply.profiles?.kyc_status
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {reply.profiles?.kyc_status === 'verified' && (
                                    <ShieldCheck size={14} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} title="Identity Verified" />
                                )}
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                    {formatDisplayName(authorName, isMobile)}
                                </span>
                            </div>
                        </ProfileHoverCard>
                        {authorUsername && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{formatUsername(authorUsername, isMobile)}</span>}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>

                        {reply.is_private && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)',
                                padding: '0.1rem 0.5rem', borderRadius: '12px', marginLeft: isMobile ? '0' : '0.5rem'
                            }}>
                                <Lock size={12} />
                                Private
                            </span>
                        )}

                        <div style={{ position: 'relative', marginLeft: 'auto' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', borderRadius: '50%' }}
                                className="nav-link-hover"
                            >
                                <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, width: '180px',
                                        background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        borderRadius: '12px', padding: '0.4rem', zIndex: 1000,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '0.25rem', display: 'flex',
                                        flexDirection: 'column', gap: '2px'
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMenuOpen(false);
                                                setIsSendToChatOpen(true);
                                            }}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '0.7rem',
                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                gap: '0.75rem', color: 'var(--text-primary)',
                                                fontSize: '0.9rem', fontWeight: 500
                                            }}
                                            className="nav-link-hover"
                                        >
                                            <Send size={18} />
                                            Send to Chat
                                        </button>

                                        {(isMe || (user && need.authorId === user.id)) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMenuOpen(false);
                                                    onArchive(reply.id);
                                                }}
                                                style={{
                                                    width: '100%', textAlign: 'left', padding: '0.7rem',
                                                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                    gap: '0.75rem', color: '#ef4444',
                                                    fontSize: '0.9rem', fontWeight: 500
                                                }}
                                                className="nav-link-hover"
                                            >
                                                <Trash2 size={18} />
                                                Archive Reply
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                            style={{
                                                width: '100%', textAlign: 'left', padding: '0.7rem',
                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                gap: '0.75rem', color: 'var(--text-primary)',
                                                fontSize: '0.9rem', fontWeight: 500
                                            }}
                                            className="nav-link-hover"
                                        >
                                            <Flag size={18} />
                                            Report
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <MentionText text={reply.content} style={{ color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }} />

                    {preview && <LinkPreviewCard preview={preview} compact={true} />}

                    {reply.file_url && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <button
                                onClick={() => onViewAttachment(reply.file_url, reply.file_type, 'Attachment')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.6rem 1rem', background: 'var(--bg-base)',
                                    border: '1px solid var(--border-glass)', borderRadius: '10px',
                                    color: 'var(--text-primary)', textDecoration: 'none',
                                    fontSize: '0.9rem', cursor: 'pointer'
                                }}
                                className="glass-panel-hover"
                            >
                                <FileText size={18} color="var(--primary)" />
                                <span style={{ fontWeight: 500 }}>View Attachment</span>
                                <Download size={14} style={{ opacity: 0.5 }} />
                            </button>
                        </div>
                    )}

                    <ReplyInteractions reply={reply} need={need} onReply={onReply} onArchive={onArchive} isMobile={isMobile} />
                </div>
            </div>

            <SendNeedToChat
                isOpen={isSendToChatOpen}
                onClose={() => setIsSendToChatOpen(false)}
                needId={reply.need_id}
                needTitle={need.title}
            />
            {reply.children && reply.children.map(child => (
                <ReplyItem key={child.id} reply={child} need={need} depth={depth + 1} onReply={onReply} onArchive={onArchive} onViewAttachment={onViewAttachment} isMobile={isMobile} />
            ))}
        </div>
    );
};

export const NeedDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [replyText, setReplyText] = useState('');
    const [isPrivateReply, setIsPrivateReply] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [replyFile, setReplyFile] = useState(null);
    const [replyImage, setReplyImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const replyComposerRef = useRef(null);
    const [isReplyExpanded, setIsReplyExpanded] = useState(false);

    const [need, setNeed] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [firstResponseTime, setFirstResponseTime] = useState(null);

    // For nested replies via modal
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [activeParentReply, setActiveParentReply] = useState(null);

    // For editing/marking met
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMarkMetModalOpen, setIsMarkMetModalOpen] = useState(false);
    const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
    const [needToEndorse, setNeedToEndorse] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);

    // For viewing attachments
    const [attachmentToView, setAttachmentToView] = useState(null);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (replyComposerRef.current && !replyComposerRef.current.contains(e.target)) {
                // Only collapse if the form is empty
                if (!replyText.trim() && !imagePreview && !replyFile) {
                    setIsReplyExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [replyText, imagePreview, replyFile]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const load = async () => {
            setLoading(true);
            try {
                const needData = await getNeedById(id);
                if (needData) {
                    const shaped = shapeNeed(needData);
                    setNeed(shaped);
                    if (user) {
                        // User interaction tracking placeholder
                    }
                    // Fetch first reply time
                    const firstReplyTs = await getFirstReplyTime(needData.id, needData.user_id);
                    if (firstReplyTs) {
                        setFirstResponseTime(formatResponseTime(needData.created_at, firstReplyTs));
                    }

                    const repliesData = await fetchRepliesForNeed(id);
                    setReplies((repliesData || []).filter(r => r.status !== 'archived'));

                    if (shaped.authorUsername) {
                        setReplyText('');
                    }
                } else {
                    navigate('/404', { replace: true });
                }
            } catch (err) {
                console.error("Failed to load need or replies:", err);
                setNeed(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    const replyTree = useMemo(() => {
        const map = {};
        const roots = [];
        replies.forEach(r => {
            map[r.id] = { ...r, children: [] };
        });
        replies.forEach(r => {
            if (r.parent_id && map[r.parent_id]) {
                map[r.parent_id].children.push(map[r.id]);
            } else {
                roots.push(map[r.id]);
            }
        });
        return roots;
    }, [replies]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;

        setSubmittingReply(true);
        try {
            let fileUrl = null;
            let fileType = null;

            if (replyImage) {
                setUploadingFile(true);
                fileUrl = await uploadImageToCloudinary(replyImage);
                fileType = 'image';
            } else if (replyFile) {
                setUploadingFile(true);
                const res = await uploadFileToCloudinary(replyFile);
                fileUrl = res.url;
                fileType = res.fileType;
            }
            setUploadingFile(false);

            const newReply = await createReply(need.id, user.id, replyText, isPrivateReply, null, null, fileUrl, fileType);
            // Re-fetch to get profile joins and proper order since RT might be complex here
            const repliesData = await fetchRepliesForNeed(id);
            setReplies(repliesData || []);
            setReplyText('');
            setIsPrivateReply(false);
            setReplyFile(null);
            setReplyImage(null);
            setImagePreview('');
        } catch (err) {
            console.error("Failed to post reply", err);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleOpenReplyToReply = (parentReply) => {
        setActiveParentReply(parentReply);
        setIsReplyModalOpen(true);
    };

    const handleModalClose = () => {
        setIsReplyModalOpen(false);
        setActiveParentReply(null);
        // Refresh replies
        fetchRepliesForNeed(id).then(data => setReplies((data || []).filter(r => r.status !== 'archived')));
    };

    const handleArchiveReply = async (replyId) => {
        if (!window.confirm("Archive this reply? It will be hidden from the thread.")) return;
        try {
            await updateReplyStatus(replyId, 'archived');
            setReplies(prev => prev.filter(r => r.id !== replyId));
        } catch (err) {
            console.error("Failed to archive reply", err);
        }
    };

    const handleEditUpdate = async (needId, updates) => {
        try {
            await updateNeed(needId, updates);
            const needData = await getNeedById(id);
            setNeed(shapeNeed(needData));
        } catch (err) {
            console.error("Failed to update need:", err);
            throw err;
        }
    };

    const handleConfirmMet = async (needId, helperProfile) => {
        try {
            await updateNeedStatus(needId, 'met', helperProfile.id);
            const needData = await getNeedById(id);
            const shaped = shapeNeed(needData);
            setNeed(shaped);

            setTimeout(() => {
                setNeedToEndorse({ ...shaped, metByProfile: helperProfile });
                setIsEndorseModalOpen(true);
            }, 2100);
        } catch (err) {
            console.error("Failed to mark met:", err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: 'var(--primary)' }}>
                <Loader size={32} className="animate-spin" />
            </div>
        );
    }

    if (!need) return null;

    // The right-panel content (shared between layouts)
    const rightPanelContent = (
        <>
            {/* Modals */}
            <ReplyModal
                isOpen={isReplyModalOpen}
                onClose={handleModalClose}
                need={need}
                parentId={activeParentReply?.id}
                replyingTo={activeParentReply ? {
                    author: activeParentReply.profiles?.display_name,
                    authorUsername: activeParentReply.profiles?.username,
                    authorAvatar: activeParentReply.profiles?.avatar_url,
                } : null}
            />
            <AttachmentModal
                isOpen={!!attachmentToView}
                onClose={() => setAttachmentToView(null)}
                fileUrl={attachmentToView?.url}
                fileType={attachmentToView?.type}
                fileName={attachmentToView?.name}
            />
            <EditNeedModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                need={need}
                onUpdate={handleEditUpdate}
            />
            <MarkMetModal
                isOpen={isMarkMetModalOpen}
                onClose={() => setIsMarkMetModalOpen(false)}
                need={need}
                onConfirm={handleConfirmMet}
            />
            <EndorseModal
                isOpen={isEndorseModalOpen}
                onClose={() => setIsEndorseModalOpen(false)}
                need={needToEndorse}
                onSuccess={async () => { }}
            />

            {/* Sticky Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.6rem var(--feed-item-padding)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px) saturate(180%)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', touchAction: 'manipulation', cursor: 'pointer', marginLeft: '-0.5rem' }}
                    className="nav-link-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Thread</h2>
            </header>

            {/* Post Card */}
            <div style={{ marginLeft: isMobile ? '' : 0, borderBottom: '1px solid var(--border-glass)' }}>
                <NeedCard
                    need={need}
                    isFullDetail={true}
                    onEdit={() => setIsEditModalOpen(true)}
                    onMarkMet={() => setIsMarkMetModalOpen(true)}
                    firstResponseTime={firstResponseTime}
                />
            </div>

            {/* Main Reply Box */}
            <div
                ref={replyComposerRef}
                style={{
                    padding: 'var(--feed-item-padding)',
                    borderBottom: '1px solid var(--border-glass)',
                    background: 'var(--bg-base)',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flexShrink: 0 }}>
                        <ProfileHoverCard userData={{
                            id: user?.id,
                            author: profile?.display_name,
                            authorUsername: profile?.username,
                            authorAvatar: profile?.avatar_url,
                            authorBio: profile?.bio,
                            authorLastSeenAt: new Date().toISOString(),
                            kycStatus: profile?.kyc_status
                        }}>
                            <div className="avatar-md" style={{
                                borderRadius: '50%',
                                background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: 'white', overflow: 'hidden',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                {!profile?.avatar_url && (profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A')}
                                <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                                    <OnlineBadge lastSeenAt={new Date().toISOString()} size="12px" />
                                </div>
                            </div>
                        </ProfileHoverCard>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {!isReplyExpanded ? (
                            <div
                                onClick={() => setIsReplyExpanded(true)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '24px',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                className="glass-panel-hover"
                            >
                                Post your reply or proposal...
                            </div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}
                                onSubmit={handleSubmitReply}
                            >
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Replying to <span style={{ color: 'var(--primary)', fontWeight: 600 }}>@{formatUsername(need.authorUsername || 'author', isMobile)}</span></span>
                                    <button
                                        type="button"
                                        onClick={() => setIsReplyExpanded(false)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Quick Responses */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    overflowX: 'auto',
                                    paddingBottom: '0.25rem',
                                    marginTop: '0.25rem',
                                    maxWidth: '100%',
                                    flexShrink: 0
                                }} className="no-scrollbar">
                                    {[
                                        { label: "I can help", text: "I can help with this!" },
                                        { label: "More details", text: "Could you provide more details?" },
                                        { label: "Interested", text: "Interested, tell me more." },
                                        { label: "Referral", text: "I know someone who can help!" }
                                    ].map((resp, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setReplyText(prev => prev ? prev + ' ' + resp.text : resp.text)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.8rem',
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-glass)',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                transition: 'all 0.2s'
                                            }}
                                            className="glass-panel-hover"
                                        >
                                            {resp.label}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    autoFocus
                                    disabled={!user || submittingReply}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Post your reply or proposal..."
                                    className="need-description"
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '80px',
                                        fontFamily: 'var(--font-family)',
                                        fontSize: '1rem',
                                        lineHeight: 1.5
                                    }}
                                />

                                {/* Media Previews */}
                                {(imagePreview || replyFile) && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {imagePreview && (
                                            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button type="button" onClick={() => { setReplyImage(null); setImagePreview(''); }} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', padding: '2px' }}><X size={12} /></button>
                                            </div>
                                        )}
                                        {replyFile && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.5rem 0.75rem', background: 'var(--bg-base)',
                                                border: '1px solid var(--border-glass)', borderRadius: '10px'
                                            }}>
                                                <FileText size={16} color="var(--primary)" />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyFile.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(replyFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                                </div>
                                                <button type="button" onClick={() => setReplyFile(null)} style={{
                                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                                                }}><X size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivateReply(!isPrivateReply)}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem',
                                            color: isPrivateReply ? 'var(--primary)' : 'var(--text-muted)',
                                            border: isPrivateReply ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                            background: isPrivateReply ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isPrivateReply ? 'Private' : 'Public'}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="file" ref={fileInputRef} onChange={(e) => { setReplyFile(e.target.files?.[0]); setReplyImage(null); setImagePreview(''); }} style={{ display: 'none' }} />
                                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setReplyImage(file);
                                                setImagePreview(URL.createObjectURL(file));
                                                setReplyFile(null);
                                            }
                                        }} style={{ display: 'none' }} />

                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            style={{
                                                padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)',
                                                background: 'transparent', border: 'none', cursor: 'pointer'
                                            }}
                                            className="nav-link-hover"
                                            title="Attach an image"
                                        >
                                            <Image size={18} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                padding: '0.5rem', borderRadius: '50%', color: 'var(--text-muted)',
                                                background: 'transparent', border: 'none', cursor: 'pointer'
                                            }}
                                            className="nav-link-hover"
                                            title="Attach a file"
                                        >
                                            <Paperclip size={18} />
                                        </button>

                                        <button type="submit" disabled={!replyText.trim() || submittingReply || !user} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', minWidth: '100px' }}>
                                            {submittingReply ? <Loader size={18} className="animate-spin" /> : (uploadingFile ? 'Uploading...' : 'Reply')}
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Thread */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replyTree.map(reply => (
                    <ReplyItem
                        key={reply.id}
                        reply={reply}
                        need={need}
                        onReply={handleOpenReplyToReply}
                        onArchive={handleArchiveReply}
                        onViewAttachment={(url, type, name) => setAttachmentToView({ url, type, name })}
                        isMobile={isMobile}
                    />
                ))}
            </div>

            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                End of thread
            </div>
        </>
    );

    // Standard stacked layout
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Helmet>
                <title>{need.title} | Ineedam</title>
                <meta property="og:title" content={`${need.title} | Ineedam`} />
                <meta property="og:description" content={need.description} />
                <meta property="og:url" content={window.location.href} />
                <meta property="twitter:title" content={`${need.title} | Ineedam`} />
                <meta property="twitter:description" content={need.description} />
                <meta property="twitter:url" content={window.location.href} />
                {need.imageUrl && (
                    <>
                        <meta property="og:image" content={need.imageUrl.startsWith('http') ? need.imageUrl : `${window.location.origin}${need.imageUrl}`} />
                        <meta property="twitter:image" content={need.imageUrl.startsWith('http') ? need.imageUrl : `${window.location.origin}${need.imageUrl}`} />
                        <meta property="twitter:card" content="summary_large_image" />
                    </>
                )}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SpecialAnnouncement",
                        "name": need.title,
                        "text": need.description,
                        "datePosted": need.created_at,
                        "category": need.category,
                        "author": {
                            "@type": "Person",
                            "name": need.author,
                            "url": `${window.location.origin}/${need.authorUsername}`
                        }
                    })}
                </script>
            </Helmet>
            {rightPanelContent}
        </div>
    );
};

const ReplyInteractions = ({ reply, need, onReply, onArchive, isMobile }) => {
    const { user } = useAuth();
    const { isLiked, toggleLike } = useLikes();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isBroadcasted, toggleBroadcast } = useBroadcasts();

    const [likeCount, setLikeCount] = useState(0);
    const [replyCount, setReplyCount] = useState(0);
    const [broadcastCount, setBroadcastCount] = useState(0);
    const [shareCopied, setShareCopied] = useState(false);

    const liked = isLiked(reply.id, 'reply');
    const bookmarked = isBookmarked(reply.id, 'reply');
    const broadcasted = isBroadcasted(reply.id, 'reply');
    const isMe = user && reply.user_id === user.id;

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const [likes, replies, broadcasts] = await Promise.all([
                    getLikeCount(null, reply.id),
                    getReplyCount(null, reply.id),
                    getBroadcastCount(reply.id, 'reply')
                ]);
                setLikeCount(likes);
                setReplyCount(replies);
                setBroadcastCount(broadcasts);
            } catch (err) {
                console.error("Error loading counts for reply interactions:", err);
            }
        };
        loadCounts();
    }, [reply.id]);

    const handleActionClick = async (e, actionFn) => {
        e.stopPropagation();
        if (actionFn === toggleBookmark) {
            await actionFn(reply.id, 'reply');
            return;
        }

        if (actionFn === toggleBroadcast) {
            await actionFn(reply.id, 'reply');
            setBroadcastCount(prev => broadcasted ? prev - 1 : prev + 1);
            return;
        }

        if (actionFn === toggleLike) {
            await actionFn(reply.id, 'reply');
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
        }
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: `Reply from ${reply.profiles?.display_name || 'User'}`,
            text: reply.content,
            url: window.location.origin + `/need/${reply.need_id}`
        };

        const fallbackCopy = async () => {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2500);
            } catch (err) {
                console.error('Clipboard fallback failed', err);
            }
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    await fallbackCopy();
                }
            }
        } else {
            await fallbackCopy();
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', color: 'var(--text-muted)', alignItems: 'center', width: '100%' }}>
            <button
                onClick={() => onReply(reply)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
                className="nav-link-hover"
            >
                <MessageSquare size={14} />
                {replyCount > 0 && <span>{replyCount}</span>}
            </button>

            {!reply.is_private && (
                <button
                    onClick={(e) => handleActionClick(e, toggleBroadcast)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: broadcasted ? 'var(--accent)' : 'inherit', padding: '0.2rem' }}
                    className="nav-link-hover"
                >
                    <Repeat2 size={14} />
                    {broadcastCount > 0 && <span>{broadcastCount}</span>}
                </button>
            )}

            <button
                onClick={(e) => handleActionClick(e, toggleLike)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : 'inherit', padding: '0.2rem' }}
                className="nav-link-hover"
            >
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            <button
                onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: shareCopied ? '#22c55e' : 'inherit', padding: '0.2rem' }}
                className="nav-link-hover"
            >
                <Share2 size={14} />
            </button>

            <button
                onClick={(e) => handleActionClick(e, toggleBookmark)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: bookmarked ? 'var(--primary)' : 'inherit', padding: '0.2rem' }}
                className="nav-link-hover"
            >
                <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
};


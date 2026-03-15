import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Lock, Globe, MessageSquare, Archive, Paperclip, FileText, Download, X, Image } from 'lucide-react';
import { ImageLightbox } from '../components/ImageLightbox';
import { OnlineBadge } from '../components/OnlineBadge';
import { NeedCard } from '../components/NeedCard';
import { getNeedById, shapeNeed, uploadFileToCloudinary, uploadImageToCloudinary, updateNeed, updateNeedStatus } from '../lib/needsService';
import { fetchRepliesForNeed, createReply, formatTimeAgo, updateReplyStatus, getFirstReplyTime, formatResponseTime } from '../lib/replyService';
import { useAuth } from '../context/AuthContext';
import { ProfileHoverCard } from '../components/ProfileHoverCard';
import { ReplyModal } from '../components/ReplyModal';
import { AttachmentModal } from '../components/AttachmentModal';
import { MentionText } from '../components/MentionText';
import { EditNeedModal } from '../components/EditNeedModal';
import { MarkMetModal } from '../components/MarkMetModal';
import { EndorseModal } from '../components/EndorseModal';
import { Helmet } from 'react-helmet-async';
import { formatDisplayName, formatUsername } from '../lib/profileService';

const ReplyItem = ({ reply, need, depth = 0, onReply, onArchive, onViewAttachment, isMobile }) => {
    const { user } = useAuth();
    const isMe = user && reply.user_id === user.id;
    const authorName = reply.profiles?.display_name || 'Anonymous';
    const authorUsername = reply.profiles?.username;
    const authorAvatar = reply.profiles?.avatar_url;

    return (
        <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? '2px solid var(--border-glass)' : 'none' }}>
            <div
                className="feed-item-hover"
                style={{
                    padding: '1rem var(--feed-item-padding)',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}
            >
                <ProfileHoverCard userData={{
                    id: reply.user_id,
                    author: authorName,
                    authorUsername: authorUsername,
                    authorAvatar: authorAvatar,
                    authorBio: reply.profiles?.bio,
                    authorLastSeenAt: reply.profiles?.last_seen_at
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
                            authorLastSeenAt: reply.profiles?.last_seen_at
                        }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>{formatDisplayName(authorName, isMobile)}</span>
                        </ProfileHoverCard>
                        {authorUsername && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{formatUsername(authorUsername, isMobile)}</span>}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>

                        {reply.is_private && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)',
                                padding: '0.1rem 0.5rem', borderRadius: '12px', marginLeft: 'auto'
                            }}>
                                <Lock size={12} />
                                Private
                            </span>
                        )}
                    </div>
                    <MentionText text={reply.content} style={{ color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }} />

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

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                        <button
                            onClick={() => onReply(reply)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                            className="nav-link-hover"
                        >
                            <MessageSquare size={14} /> Reply
                        </button>

                        {(isMe || (user && need.authorId === user.id)) && (
                            <button
                                onClick={() => onArchive(reply.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                className="nav-link-hover"
                                title="Archive Reply"
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                            >
                                <Archive size={14} /> Archive
                            </button>
                        )}
                    </div>
                </div>
            </div>
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
    const fileInputRef = React.useRef(null);
    const imageInputRef = React.useRef(null);

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
                onSuccess={async () => {}}
            />

            {/* Sticky Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem var(--feed-item-padding)', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', touchAction: 'manipulation', cursor: 'pointer' }}
                    className="nav-link-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Thread</h2>
            </header>

            {/* Post Card */}
            <div style={{ padding: '', borderBottom: '1px solid var(--border-glass)' }}>
                <NeedCard
                    need={need}
                    isFullDetail={true}
                    onEdit={() => setIsEditModalOpen(true)}
                    onMarkMet={() => setIsMarkMetModalOpen(true)}
                    firstResponseTime={firstResponseTime}
                />
            </div>

            {/* Main Reply Box */}
            <div style={{ display: 'flex', gap: '1rem', padding: 'var(--feed-item-padding)', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
                <div style={{ flexShrink: 0 }}>
                    <div className="avatar-md" style={{
                        borderRadius: '50%',
                        background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', overflow: 'hidden'
                    }}>
                        {!profile?.avatar_url && (profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A')}
                    </div>
                </div>
                <form style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onSubmit={handleSubmitReply}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Replying to <span style={{ color: 'var(--primary)', fontWeight: 600 }}>@{formatUsername(need.authorUsername || 'author', isMobile)}</span>
                    </div>
                    <textarea
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
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
                </form>
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
                <meta property="twitter:title" content={`${need.title} | Ineedam`} />
                <meta property="twitter:description" content={need.description} />
                {need.imageUrl && (
                    <>
                        <meta property="og:image" content={need.imageUrl} />
                        <meta property="twitter:image" content={need.imageUrl} />
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


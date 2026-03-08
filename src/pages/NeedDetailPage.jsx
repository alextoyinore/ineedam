import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader, Lock, Globe, MessageSquare, Archive, Paperclip, FileText, Download, X } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { getNeedById, shapeNeed, uploadFileToCloudinary } from '../lib/needsService';
import { fetchRepliesForNeed, createReply, formatTimeAgo, updateReplyStatus } from '../lib/replyService';
import { useAuth } from '../context/AuthContext';
import { ProfileHoverCard } from '../components/ProfileHoverCard';
import { ReplyModal } from '../components/ReplyModal';
import { AttachmentModal } from '../components/AttachmentModal';
import { MentionText } from '../components/MentionText';
import { EditNeedModal } from '../components/EditNeedModal';
import { MarkMetModal } from '../components/MarkMetModal';
import { EndorseModal } from '../components/EndorseModal';
import { Helmet } from 'react-helmet-async';

const ReplyItem = ({ reply, need, depth = 0, onReply, onArchive, onViewAttachment }) => {
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
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                }}
            >
                <ProfileHoverCard userData={{
                    id: reply.user_id,
                    author: authorName,
                    authorUsername: authorUsername,
                    authorAvatar: authorAvatar,
                    authorBio: reply.profiles?.bio
                }}>
                    <div className="avatar-md" style={{
                        borderRadius: '50%', flexShrink: 0,
                        background: authorAvatar ? `url(${authorAvatar}) center / cover` : (isMe ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-surface)'),
                        border: (isMe || authorAvatar) ? 'none' : '1px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: isMe ? 'white' : 'var(--text-primary)',
                        overflow: 'hidden', cursor: 'pointer'
                    }}>
                        {!authorAvatar && authorName.charAt(0).toUpperCase()}
                    </div>
                </ProfileHoverCard>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <ProfileHoverCard userData={{
                            id: reply.user_id,
                            author: authorName,
                            authorUsername: authorUsername,
                            authorAvatar: authorAvatar,
                            authorBio: reply.profiles?.bio
                        }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>{authorName}</span>
                        </ProfileHoverCard>
                        {authorUsername && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{authorUsername}</span>}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {formatTimeAgo(reply.created_at)}</span>

                        {reply.is_private && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
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
                <ReplyItem key={child.id} reply={child} need={need} depth={depth + 1} onReply={onReply} onArchive={onArchive} onViewAttachment={onViewAttachment} />
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
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = React.useRef(null);

    const [need, setNeed] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    // For nested replies via modal
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [activeParentReply, setActiveParentReply] = useState(null);

    // For editing/marking met
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMarkMetModalOpen, setIsMarkMetModalOpen] = useState(false);
    const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false);
    const [needToEndorse, setNeedToEndorse] = useState(null);

    // For viewing attachments
    const [attachmentToView, setAttachmentToView] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const load = async () => {
            setLoading(true);
            try {
                const [needData, repliesData] = await Promise.all([
                    getNeedById(id),
                    fetchRepliesForNeed(id) // fetchRepliesForNeed(id) now implicitly filters for endorsement_id IS NULL
                ]);
                const shaped = shapeNeed(needData);
                setNeed(shaped);
                setReplies((repliesData || []).filter(r => r.status !== 'archived'));

                // Pre-fill mention if the user is replying to the author
                if (shaped.authorUsername) {
                    setReplyText(`@${shaped.authorUsername} `);
                }
            } catch (err) {
                console.error("Failed to load need or replies:", err);
                setNeed(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

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
            if (replyFile) {
                setUploadingFile(true);
                const res = await uploadFileToCloudinary(replyFile);
                fileUrl = res.url;
                fileType = res.fileType;
                setUploadingFile(false);
            }

            const newReply = await createReply(need.id, user.id, replyText, isPrivateReply, null, null, fileUrl, fileType);
            // Re-fetch to get profile joins and proper order since RT might be complex here
            const repliesData = await fetchRepliesForNeed(id);
            setReplies(repliesData || []);
            setReplyText(need.authorUsername ? `@${need.authorUsername} ` : '');
            setIsPrivateReply(false);
            setReplyFile(null);
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
            </Helmet>

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
                onSuccess={async () => {
                    // Refetch if needed, though endorsements are on profile usually
                }}
            />

            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                background: 'var(--bg-surface-glass)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); navigate(-1); }}
                    style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)', touchAction: 'manipulation', cursor: 'pointer' }}
                    className="nav-link-hover"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Thread</h2>
            </header>

            <div style={{ padding: '', borderBottom: '1px solid var(--border-glass)' }}>
                <NeedCard
                    need={need}
                    isFullDetail={true}
                    onEdit={() => setIsEditModalOpen(true)}
                    onMarkMet={() => setIsMarkMetModalOpen(true)}
                />
            </div>

            {/* Main Reply Box */}
            <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}>
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
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Replying to @${need.authorUsername || 'author'}...`}
                        disabled={!user || submittingReply}
                        className="need-description"
                        style={{
                            width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            outline: 'none', resize: 'vertical', minHeight: '60px'
                        }}
                    />

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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsPrivateReply(!isPrivateReply)}
                            className="btn btn-secondary"
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: isPrivateReply ? 'var(--primary)' : 'var(--text-muted)',
                                border: isPrivateReply ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                background: isPrivateReply ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                            }}
                        >
                            {isPrivateReply ? <Lock size={14} /> : <Globe size={14} />}
                            {isPrivateReply ? 'Private Reply' : 'Public Reply'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="file" ref={fileInputRef} onChange={(e) => setReplyFile(e.target.files?.[0])} style={{ display: 'none' }} />
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

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {replyTree.map(reply => (
                    <ReplyItem
                        key={reply.id}
                        reply={reply}
                        need={need}
                        onReply={handleOpenReplyToReply}
                        onArchive={handleArchiveReply}
                        onViewAttachment={(url, type, name) => setAttachmentToView({ url, type, name })}
                    />
                ))}
            </div>

            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                End of thread
            </div>
        </div>
    );
};

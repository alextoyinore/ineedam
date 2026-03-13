import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader, Paperclip, FileText, Image } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { createReply } from '../lib/replyService';
import { uploadFileToCloudinary, uploadImageToCloudinary } from '../lib/needsService';
import { formatDisplayName, formatUsername } from '../lib/profileService';
import { useNavigate } from 'react-router-dom';

export const ReplyModal = ({ isOpen, onClose, need, parentId = null, replyingTo = null, onReply, endorsementId = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [replyText, setReplyText] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [submitting, setSubmitting] = useState(false);
    const [replyFile, setReplyFile] = useState(null);
    const [replyImage, setReplyImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 435);
    const fileInputRef = React.useRef(null);
    const imageInputRef = React.useRef(null);

    const targetUser = replyingTo || {
        author: need.author,
        authorUsername: need.authorUsername,
        authorAvatar: need.authorAvatar,
        postedAt: need.postedAt
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 435);
        window.addEventListener('resize', handleResize);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setReplyText('');
            setReplyFile(null);
            setReplyImage(null);
            setImagePreview('');
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !user) return;

        setSubmitting(true);
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

            const isPrivate = visibility === 'private';
            const newReply = await createReply(need.id, user.id, replyText, isPrivate, parentId, endorsementId, fileUrl, fileType);

            if (onReply) {
                onReply(newReply);
            }
            onClose();
        } catch (err) {
            console.error("Failed to post reply via modal", err);
            alert("Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 2000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'flex-start', justifyContent: 'center',
                padding: isMobile ? '0' : '4rem 1rem', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
            }} onClick={onClose}>
                <motion.div
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 100 : -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 100 : -20 }}
                    className="glass-panel"
                    style={{
                        width: '100%', maxWidth: '600px',
                        background: 'var(--bg-surface)', position: 'relative',
                        display: 'flex', flexDirection: 'column', 
                        borderRadius: isMobile ? '20px 20px 0 0' : '16px', 
                        overflow: 'hidden',
                        height: isMobile ? '60dvh' : 'auto',
                        maxHeight: isMobile ? '60dvh' : '90dvh'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)'
                    }}>
                        <button onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Original Need Context */}
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                        {/* Vertical connection line */}
                        <div style={{ position: 'absolute', left: '2.45rem', top: '3.5rem', bottom: 0, width: '2px', background: 'var(--border-glass)' }} />

                        <div className="avatar-md" style={{
                            borderRadius: '50%', flexShrink: 0,
                            background: targetUser.authorAvatar ? `url(${targetUser.authorAvatar}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                            fontWeight: 'bold', color: 'white', overflow: 'hidden'
                        }}>
                            {!targetUser.authorAvatar && targetUser.author.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{formatDisplayName(targetUser.author, isMobile)}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>• {targetUser.postedAt || 'just now'}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                Replying to <span style={{ color: 'var(--primary)' }}>@{formatUsername(targetUser.authorUsername || targetUser.author.toLowerCase().replace(/\s/g, ''), isMobile)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', gap: '1rem', flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
                        <div className="avatar-md" style={{
                            borderRadius: '50%', flexShrink: 0,
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                            fontWeight: 'bold', color: 'var(--text-primary)', overflow: 'hidden'
                        }}>
                            {user?.user_metadata?.avatar_url || user?.avatar_url ? (
                                <img src={user.user_metadata?.avatar_url || user?.avatar_url} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                (user?.user_metadata?.display_name || user?.email || 'A').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <textarea
                                required
                                autoFocus
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
                                    resize: 'none',
                                    paddingTop: '0.5rem',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    lineHeight: 1.5,
                                    flex: 1
                                }}
                            />

                             {/* Media Previews */}
                            {(imagePreview || replyFile) && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
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

                            {/* Footer Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', marginTop: '0.5rem' }}>
                                {/* Visibility Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setVisibility(v => v === 'private' ? 'public' : 'private')}
                                    className="btn btn-secondary"
                                    style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.85rem',
                                        color: visibility === 'private' ? 'var(--primary)' : 'var(--text-muted)',
                                        border: visibility === 'private' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                                        background: visibility === 'private' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {visibility === 'private' ? 'Private' : 'Public'}
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

                                    <button type="submit" disabled={!replyText.trim() || submitting || !user} className="btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                        {uploadingFile ? 'Uploading...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

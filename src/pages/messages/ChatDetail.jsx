import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, X, FileText, Image as ImageIcon, Mic, PhoneOff, Reply, Smile, MessageSquare, Bookmark, Check } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';
import { VoiceRecorder } from '../../components/messages/VoiceRecorder';
import { AudioBubble } from '../../components/messages/AudioBubble';

const MAX_FILE_SIZE_MB = 10;

const FilePreviewBubble = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 0.75rem', borderRadius: '12px',
            background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
            marginBottom: '0.5rem', maxWidth: '280px'
        }}>
            {isImage ? (
                <img src={previewUrl} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
            ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="var(--primary)" />
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '50%', flexShrink: 0 }}>
                <X size={16} />
            </button>
        </div>
    );
};

// WhatsApp-style tick icons for sent messages
const MessageStatus = ({ isRead }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '2px', flexShrink: 0 }}>
        {isRead ? (
            // Double tick — blue when read
            <span style={{ display: 'inline-flex', position: 'relative', width: '18px', height: '12px' }}>
                <Check size={11} strokeWidth={3} style={{ position: 'absolute', left: 0, color: '#4fc3f7' }} />
                <Check size={11} strokeWidth={3} style={{ position: 'absolute', left: '5px', color: '#4fc3f7' }} />
            </span>
        ) : (
            // Single tick — grey when just sent
            <span style={{ display: 'inline-flex', position: 'relative', width: '13px', height: '12px' }}>
                <Check size={11} strokeWidth={3} style={{ color: 'rgba(255,255,255,0.65)' }} />
            </span>
        )}
    </span>
);

const ReactionsDisplay = ({ reactions, onToggle, currentUserId }) => {
    if (!reactions || reactions.length === 0) return null;

    // Group reactions by emoji
    const grouped = reactions.reduce((acc, r) => {
        acc[r.emoji] = acc[r.emoji] || [];
        acc[r.emoji].push(r.user_id);
        return acc;
    }, {});

    return (
        <div className="reactions-display">
            {Object.entries(grouped).map(([emoji, userIds]) => {
                const isMine = userIds.includes(currentUserId);
                return (
                    <div
                        key={emoji}
                        className={`reaction-badge ${isMine ? 'is-mine' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onToggle(emoji); }}
                    >
                        <span>{emoji}</span>
                        <span>{userIds.length}</span>
                    </div>
                );
            })}
        </div>
    );
};

const EmojiPicker = ({ onSelect, onClose }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    return (
        <div className="emoji-picker-overlay" onClick={e => e.stopPropagation()}>
            {emojis.map(emoji => (
                <button
                    key={emoji}
                    className="emoji-btn"
                    onClick={() => { onSelect(emoji); onClose(); }}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

const MessageAttachment = ({ fileUrl, fileType, onView }) => {
    const isImage = fileType?.startsWith('image/');
    const fileName = fileUrl?.split('/').pop() || 'File';

    if (isImage) {
        return (
            <div onClick={() => onView({ url: fileUrl, type: fileType, name: fileName })} style={{ display: 'block', marginBottom: '0.25rem', cursor: 'pointer' }}>
                <img
                    src={fileUrl}
                    alt="attachment"
                    style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                />
            </div>
        );
    }

    return (
        <div
            onClick={() => onView({ url: fileUrl, type: fileType, name: fileName })}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)', marginBottom: '0.25rem',
                color: 'inherit', textDecoration: 'none', cursor: 'pointer'
            }}
        >
            <FileText size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{fileName}</span>
        </div>
    );
};

const FileViewerModal = ({ file, onClose }) => {
    const isImage = file.type?.startsWith('image/');

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10000
                }}
            >
                <X size={24} />
            </button>

            <div onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {isImage ? (
                    <img
                        src={file.url}
                        alt="attachment view"
                        style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
                    />
                ) : (
                    <iframe
                        src={file.url}
                        title="File Viewer"
                        style={{ width: '80vw', height: '80vh', maxWidth: '1000px', backgroundColor: 'white', borderRadius: '8px', border: 'none' }}
                    />
                )}
                {!isImage && (
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ marginTop: '1.5rem' }}
                    >
                        Download File
                    </a>
                )}
            </div>
        </motion.div>,
        document.body
    );
};

export const ChatDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const {
        threads, sendMessage, markThreadAsRead, loadingThreads, setActiveThreadId, initiateCall,
        replyingTo, setReplyingTo, toggleReaction, toggleBookmark
    } = useMessages();
    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const [activeEmojiMessageId, setActiveEmojiMessageId] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeThread = threads.find(t => String(t.id) === String(threadId));

    useEffect(() => {
        if (threadId) setActiveThreadId(threadId);
        return () => setActiveThreadId(null);
    }, [threadId, setActiveThreadId]);

    useEffect(() => {
        if (activeThread?.unread) markThreadAsRead(activeThread.id);
    }, [activeThread, markThreadAsRead]);

    if (loadingThreads && !activeThread) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--border-glass)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!activeThread) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a message to start chatting
            </div>
        );
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            alert(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
            return;
        }
        setSelectedFile(file);
        e.target.value = '';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() && !selectedFile) return;

        setIsUploading(true);
        const fileToSend = selectedFile;
        const textToSend = messageText;
        setMessageText('');
        setSelectedFile(null);

        await sendMessage(activeThread.withUserId, textToSend, fileToSend || null);
        setIsUploading(false);
    };

    const handleReply = (msg) => {
        setReplyingTo({
            id: msg.id,
            text: msg.text || (msg.fileUrl ? '📎 Attachment' : 'Message'),
            sender: msg.sender
        });
    };

    const scrollToMessage = (msgId) => {
        const element = document.getElementById(`msg-${msgId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-message');
            setTimeout(() => element.classList.remove('highlight-message'), 2000);
        }
    };

    const handleSendVoiceNote = async (blob, duration) => {
        setIsUploading(true);
        // Create a File object from the blob for Cloudinary
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        await sendMessage(activeThread.withUserId, '', file);
        setIsUploading(false);
        setIsRecording(false);
    };

    const canSend = (messageText.trim() || selectedFile) && !isUploading;

    return (
        <motion.div
            initial={{ opacity: 0, x: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 20 : 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', height: '100%', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}
        >
            {/* Header */}
            <header style={{
                padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-surface)', zIndex: 30, flexShrink: 0,
                position: 'sticky', top: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/messages')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', marginLeft: '-0.5rem', borderRadius: '50%' }}
                        className="glass-panel-hover"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <Link
                        to={`/${activeThread.withUserUsername}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}
                        className="nav-link-hover"
                    >
                        <div className="avatar-md" style={{
                            borderRadius: '50%',
                            background: activeThread.withUserAvatar ? `url(${activeThread.withUserAvatar}) center/cover` : 'var(--bg-base)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', overflow: 'hidden'
                        }}>
                            {!activeThread.withUserAvatar && activeThread.withUser.charAt(0)}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{activeThread.withUser}</h3>
                            {activeThread.withUserUsername && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{activeThread.withUserUsername}</span>}
                        </div>
                    </Link>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Phone
                        size={20}
                        style={{ cursor: 'pointer' }}
                        onClick={() => initiateCall(activeThread.withUserId, activeThread.withUser, activeThread.withUserAvatar, false)}
                    />
                    <Video
                        size={20}
                        style={{ cursor: 'pointer' }}
                        onClick={() => initiateCall(activeThread.withUserId, activeThread.withUser, activeThread.withUserAvatar, true)}
                    />
                    <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                </div>
            </header>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem',
                display: 'flex', flexDirection: 'column-reverse', gap: '0.4rem',
                WebkitOverflowScrolling: 'touch',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg stroke='%236366f1' stroke-opacity='0.02' fill='none' stroke-width='1.5'%3E%3Cpath d='M40 40h60c8 0 15 7 15 15v40c0 8-7 15-15 15h-20l-15 15v-15h-25c-8 0-15-7-15-15v-40c0-8 7-15 15-15z'/%3E%3Cpath d='M160 160l30-30 15 15-30 30z M195 125l15-15 15 15-15 15z M155 165l5 25-25-5z'/%3E%3Cpath d='M160 40h30c4 0 8 4 8 8v15c0 4-4 8-8 8h-5l-10 10v-10h-15c-4 0-8-4-8-8v-15c0-4 4-8 8-8z'/%3E%3C/g%3E%3C/svg%3E\")"
            }}>
                {[...activeThread.messages].reverse().map(msg => {
                    const isMe = msg.sender === 'Me';
                    const isAudio = msg.fileType?.startsWith('audio/') || msg.fileUrl?.toLowerCase().endsWith('.webm') || msg.fileUrl?.toLowerCase().endsWith('.mp3') || msg.fileUrl?.toLowerCase().endsWith('.wav');
                    const isCall = msg.text?.startsWith('[CALL_');
                    const isMissedCall = msg.text?.includes('MISSED') || msg.text?.includes('REJECTED') || msg.text?.includes('CANCELLED');
                    const replyMsg = msg.replyTo ? activeThread.messages.find(m => m.id === msg.replyTo) : null;

                    return (
                        <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`message-bubble-row ${isMe ? 'is-me' : 'is-them'}`}
                            style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                marginBottom: '0.2rem',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: isMe ? 'row' : 'row-reverse',
                                alignItems: 'flex-end',
                                gap: '0.5rem',
                                position: 'relative',
                                width: 'fit-content'
                            }} className="message-main-content">
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px', marginBottom: '0.4rem', opacity: 0.9, position: 'relative' }}>
                                    {!isCall && (
                                        <div className={`message-actions-inline ${isMe ? 'is-me' : 'is-them'}`}>
                                            <button className="message-action-btn" onClick={() => handleReply(msg)} title="Reply">
                                                <Reply size={14} />
                                            </button>
                                            <button
                                                className="message-action-btn"
                                                onClick={() => toggleBookmark(msg.id)}
                                                style={{ color: msg.isBookmarked ? 'var(--primary)' : 'inherit' }}
                                                title={msg.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                                            >
                                                <Bookmark size={14} fill={msg.isBookmarked ? "var(--primary)" : "none"} />
                                            </button>
                                            <div className="emoji-picker-container">
                                                <button className="message-action-btn" onClick={() => setActiveEmojiMessageId(activeEmojiMessageId === msg.id ? null : msg.id)}>
                                                    <Smile size={14} />
                                                </button>
                                                {activeEmojiMessageId === msg.id && (
                                                    <EmojiPicker
                                                        onSelect={(emoji) => toggleReaction(msg.id, emoji)}
                                                        onClose={() => setActiveEmojiMessageId(null)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        {msg.isBookmarked && <Bookmark size={10} fill="var(--primary)" color="var(--primary)" />}
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && !isCall && (
                                            <MessageStatus
                                                isRead={!!(activeThread.recipientLastReadAt && new Date(activeThread.recipientLastReadAt) >= new Date(msg.timestamp))}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    padding: (msg.fileUrl && !msg.text && !isAudio) ? '0' : '0.6rem 1rem',
                                    borderRadius: isMissedCall ? '12px' : '18px',
                                    borderBottomRightRadius: isMe ? '4px' : (isMissedCall ? '12px' : '18px'),
                                    borderBottomLeftRadius: isMe ? (isMissedCall ? '12px' : '18px') : '4px',
                                    background: (msg.fileUrl && !msg.text && !isAudio) ? 'transparent' : (isMe ? 'var(--primary)' : 'var(--bg-surface)'),
                                    border: isMe ? 'none' : '1px solid var(--border-glass)',
                                    color: isMe ? 'white' : 'var(--text-primary)',
                                    fontSize: '0.92rem',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    boxShadow: isMe ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }} className="message-bubble">
                                    {replyMsg && (
                                        <div
                                            className="reply-context"
                                            onClick={() => scrollToMessage(replyMsg.id)}
                                            style={{ color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                                {replyMsg.sender === 'Me' ? 'You' : activeThread.withUser}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                {replyMsg.text || '📎 Attachment'}
                                            </div>
                                        </div>
                                    )}

                                    {isCall ? (
                                        <div
                                            onClick={() => {
                                                const isVideo = msg.text.toLowerCase().includes('video');
                                                initiateCall(activeThread.withUserId, activeThread.withUser, activeThread.withUserAvatar, isVideo);
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                        >
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: isMe ? 'rgba(255,255,255,0.2)' : (() => {
                                                    if (msg.text.includes('SUCCESS')) return 'rgba(34, 197, 94, 0.1)';
                                                    if (msg.text.includes('REJECTED')) return 'rgba(239, 68, 68, 0.1)';
                                                    return 'rgba(99, 102, 241, 0.1)'; // Missed or Cancelled
                                                })(),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {(() => {
                                                    const isVideo = msg.text.toLowerCase().includes('video');
                                                    if (msg.text.includes('SUCCESS')) {
                                                        return isVideo ? <Video size={16} color={isMe ? 'white' : '#22c55e'} /> : <Phone size={16} color={isMe ? 'white' : '#22c55e'} />;
                                                    }
                                                    if (msg.text.includes('REJECTED')) {
                                                        return <PhoneOff size={16} color={isMe ? 'white' : '#ef4444'} />;
                                                    }
                                                    // Missed or Cancelled
                                                    return isVideo ? <Video size={16} color={isMe ? 'white' : 'var(--primary)'} /> : <Phone size={16} color={isMe ? 'white' : 'var(--primary)'} />;
                                                })()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {(() => {
                                                        const isVideo = msg.text.toLowerCase().includes('video');
                                                        const type = isVideo ? 'Video' : 'Voice';
                                                        if (msg.text.includes('SUCCESS')) return `${type} Call`;
                                                        if (msg.text.includes('MISSED')) return 'Missed Call';
                                                        if (msg.text.includes('REJECTED')) return isMe ? 'Canceled Call' : 'Refused Call';
                                                        if (msg.text.includes('CANCELLED')) return isMe ? 'Canceled Call' : 'Missed Call';
                                                        return 'Call';
                                                    })()}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                    {msg.text.includes('SUCCESS') ? (msg.text.split('•')[1]?.trim() || 'Call ended') : 'Tap to call back'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.fileUrl && (
                                                isAudio ? (
                                                    <AudioBubble
                                                        id={msg.id}
                                                        url={msg.fileUrl}
                                                        isMe={isMe}
                                                        currentlyPlayingId={currentlyPlayingId}
                                                        onTogglePlay={() => setCurrentlyPlayingId(currentlyPlayingId === msg.id ? null : msg.id)}
                                                    />
                                                ) : (
                                                    <MessageAttachment fileUrl={msg.fileUrl} fileType={msg.fileType} onView={setViewingFile} />
                                                )
                                            )}
                                            {msg.text && <span>{msg.text}</span>}
                                        </>
                                    )}
                                </div>

                            </div>

                            {/* Reactions stack below the main row */}
                            <ReactionsDisplay
                                reactions={msg.reactions}
                                onToggle={(emoji) => toggleReaction(msg.id, emoji)}
                                currentUserId={activeThread.senderId}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface)', zIndex: 30, flexShrink: 0 }}>
                {replyingTo && (
                    <div className="reply-preview">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.75rem' }}>
                                Replying to {replyingTo.sender === 'Me' ? 'yourself' : replyingTo.sender}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {replyingTo.text}
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {selectedFile && (
                    <FilePreviewBubble file={selectedFile} onRemove={() => setSelectedFile(null)} />
                )}

                <AnimatePresence>
                    {isRecording && (
                        <VoiceRecorder
                            onSend={handleSendVoiceNote}
                            onCancel={() => setIsRecording(false)}
                            onStartRecording={() => setCurrentlyPlayingId('recording')}
                        />
                    )}
                </AnimatePresence>

                {!isRecording && (
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        {/* Attachment button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                color: selectedFile ? 'var(--primary)' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                        >
                            <Paperclip size={18} />
                        </button>

                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={selectedFile ? 'Add a caption...' : 'Start a new message'}
                            style={{
                                flex: 1, padding: '0.75rem 1.25rem', borderRadius: '9999px',
                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                color: 'var(--text-primary)', outline: 'none'
                            }}
                        />

                        {/* Voice Note button - only if no text/file */}
                        {!messageText.trim() && !selectedFile ? (
                            <button
                                type="button"
                                onClick={() => setIsRecording(true)}
                                style={{
                                    width: '45px', height: '45px', borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--bg-base)', color: 'var(--primary)', border: '1px solid var(--border-glass)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Mic size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!canSend}
                                style={{
                                    width: '45px', height: '45px', borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--primary)', color: 'white', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: canSend ? 'pointer' : 'default',
                                    opacity: canSend ? 1 : 0.5, transition: 'all 0.2s'
                                }}
                            >
                                {isUploading ? (
                                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        )}
                    </form>
                )}
            </footer>

            {/* File Viewer Modal */}
            <AnimatePresence>
                {viewingFile && (
                    <FileViewerModal
                        file={viewingFile}
                        onClose={() => setViewingFile(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div >
    );
};

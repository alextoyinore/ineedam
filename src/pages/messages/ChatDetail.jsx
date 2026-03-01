import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';

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
    const { threads, sendMessage, markThreadAsRead, loadingThreads, setActiveThreadId } = useMessages();
    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const fileInputRef = useRef(null);

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

    const canSend = (messageText.trim() || selectedFile) && !isUploading;

    return (
        <motion.div
            initial={{ opacity: 0, x: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 20 : 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', height: '100%', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}
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
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Phone size={20} style={{ cursor: 'pointer' }} />
                    <Video size={20} style={{ cursor: 'pointer' }} />
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
                    return (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', display: 'flex',
                                flexDirection: isMe ? 'row' : 'row-reverse',
                                alignItems: 'flex-end', gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div style={{
                                padding: msg.fileUrl && !msg.text ? '0' : '0.6rem 1rem',
                                borderRadius: '18px',
                                borderBottomRightRadius: isMe ? '4px' : '18px',
                                borderBottomLeftRadius: isMe ? '18px' : '4px',
                                background: msg.fileUrl && !msg.text ? 'transparent' : (isMe ? 'var(--primary)' : 'var(--bg-base)'),
                                color: isMe ? 'white' : 'var(--text-primary)',
                                fontSize: '0.92rem',
                                overflow: 'hidden',
                            }}>
                                {msg.fileUrl && <MessageAttachment fileUrl={msg.fileUrl} fileType={msg.fileType} onView={setViewingFile} />}
                                {msg.text && <span>{msg.text}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface)', zIndex: 30, flexShrink: 0 }}>
                {selectedFile && (
                    <FilePreviewBubble file={selectedFile} onRemove={() => setSelectedFile(null)} />
                )}
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
                </form>
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
        </motion.div>
    );
};

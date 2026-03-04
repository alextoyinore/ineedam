import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

export const AttachmentModal = ({ isOpen, onClose, fileUrl, fileType, fileName }) => {
    if (!isOpen || !fileUrl) return null;

    const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
    const isPDF = fileType === 'application/pdf' || /\.pdf$/i.test(fileUrl);
    const isVideo = fileType?.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(fileUrl);

    return (
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)'
                }}
                onClick={onClose}
            >
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', zIndex: 2501 }}>
                    <a
                        href={fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                            padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.9rem',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem',
                            textDecoration: 'none', transition: 'all 0.2s'
                        }}
                    >
                        <Download size={18} />
                        Download
                    </a>
                    <button
                        onClick={onClose}
                        style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        maxWidth: 'min(1200px, 95vw)',
                        maxHeight: '92vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2500
                    }}
                >
                    {/* Content */}
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isImage ? (
                            <img
                                src={fileUrl}
                                alt={fileName || 'Attachment'}
                                style={{
                                    maxWidth: '100%', maxHeight: '92vh',
                                    objectFit: 'contain', borderRadius: '12px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            />
                        ) : isVideo ? (
                            <video
                                src={fileUrl}
                                controls
                                autoPlay
                                style={{
                                    maxWidth: '100%', maxHeight: '92vh',
                                    outline: 'none', borderRadius: '12px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : isPDF ? (
                            <div style={{ width: '80vw', maxWidth: '1000px' }}>
                                <iframe
                                    src={`${fileUrl}#toolbar=0`}
                                    style={{
                                        width: '100%', height: '85vh', border: 'none', borderRadius: '16px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    title="PDF Preview"
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'white' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                                }}>
                                    <FileText size={40} />
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Full Preview Unavailable</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                                    This file type cannot be previewed directly in the browser.
                                </p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <ExternalLink size={18} />
                                    Open in New Tab
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

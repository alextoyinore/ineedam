import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

/**
 * Reusable full-screen image lightbox component.
 * - Click outside or press Escape to close
 * - Download / open in new tab actions
 */
export const ImageLightbox = ({ src, alt = '', isOpen, onClose }) => {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!src) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0, 0, 0, 0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    {/* Toolbar */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            display: 'flex', gap: '0.5rem', zIndex: 10000
                        }}
                    >
                        <a
                            href={src}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer', textDecoration: 'none'
                            }}
                            title="Download"
                        >
                            <Download size={16} />
                        </a>
                        <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer', textDecoration: 'none'
                            }}
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>
                        <button
                            onClick={onClose}
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer'
                            }}
                            title="Close (Esc)"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Image */}
                    <motion.img
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        src={src}
                        alt={alt}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 6rem)',
                            objectFit: 'contain',
                            borderRadius: '12px',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                            cursor: 'default',
                            userSelect: 'none'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Wrapper that makes any image clickable + shows a preview cursor hint.
 */
export const PreviewableImage = ({ src, alt = '', style = {}, className = '', ...props }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    if (!src) return null;
    return (
        <>
            <img
                src={src}
                alt={alt}
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className={className}
                style={{
                    cursor: 'zoom-in',
                    ...style
                }}
                {...props}
            />
            <ImageLightbox src={src} alt={alt} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

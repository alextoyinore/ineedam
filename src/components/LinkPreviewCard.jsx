import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Renders a rich link preview card from Open Graph metadata.
 * Used below need descriptions and replies when a URL is detected.
 */
export const LinkPreviewCard = ({ preview, compact = false }) => {
    if (!preview?.title && !preview?.image) return null;

    const domain = (() => {
        try {
            return new URL(preview.url).hostname.replace('www.', '');
        } catch {
            return preview.siteName || '';
        }
    })();

    return (
        <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            onClick={e => e.stopPropagation()}
        >
            <div style={{
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginTop: '0.6rem',
                background: 'var(--bg-base)',
                transition: 'opacity 0.15s',
                maxWidth: compact ? '300px' : '100%',
            }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                {/* OG Image */}
                {preview.image && (
                    <div style={{ width: '100%', aspectRatio: compact ? '2/1' : '1.91/1', maxHeight: compact ? '120px' : '200px', overflow: 'hidden' }}>
                        <img
                            src={preview.image}
                            alt={preview.title || 'Link preview'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.parentElement.style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Text content */}
                <div style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem' }}>
                    {/* Site info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                        {preview.favicon && (
                            <img
                                src={preview.favicon}
                                alt=""
                                style={{ width: '14px', height: '14px', borderRadius: '2px', objectFit: 'contain' }}
                                onError={e => e.target.style.display = 'none'}
                            />
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {preview.siteName || domain}
                        </span>
                        <ExternalLink size={10} style={{ color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
                    </div>

                    {/* Title */}
                    {preview.title && (
                        <p style={{
                            margin: '0 0 0.2rem',
                            fontSize: compact ? '0.82rem' : '0.9rem',
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: 'var(--text-primary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {preview.title}
                        </p>
                    )}

                    {/* Description */}
                    {preview.description && !compact && (
                        <p style={{
                            margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                            {preview.description}
                        </p>
                    )}
                </div>
            </div>
        </a>
    );
};

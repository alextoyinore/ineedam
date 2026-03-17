import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNeedById, shapeNeed } from '../../lib/needsService';
import { ExternalLink, Tag, MapPin, Loader } from 'lucide-react';

/**
 * A compact card shown inside a chat bubble when a message references a need post.
 * Fetches and displays the need's title, author, category, and status.
 */
export const NeedReferenceBubble = ({ needId, isMe }) => {
    const navigate = useNavigate();
    const [need, setNeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!needId) return;
        let cancelled = false;
        const load = async () => {
            try {
                const data = await getNeedById(needId);
                if (cancelled) return;
                if (!data) { setNotFound(true); setLoading(false); return; }
                setNeed(shapeNeed(data));
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [needId]);

    const statusColor = need?.status === 'met' ? '#22c55e' : need?.status === 'closed' ? '#ef4444' : '#f59e0b';
    const statusLabel = need?.status === 'met' ? 'Met' : need?.status === 'closed' ? 'Closed' : 'Open';

    const cardStyle = {
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '0.4rem',
        maxWidth: '260px',
        border: isMe ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border-glass)',
        background: isMe ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface)',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
    };

    if (loading) {
        return (
            <div style={{ ...cardStyle, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', opacity: 0.6 }}>
                <Loader size={14} className="animate-spin" />
                <span style={{ fontSize: '0.8rem' }}>Loading need...</span>
            </div>
        );
    }

    if (notFound || !need) {
        return (
            <div style={{ ...cardStyle, padding: '0.75rem 1rem', opacity: 0.6 }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic' }}>Need no longer available</p>
            </div>
        );
    }

    return (
        <div
            style={cardStyle}
            onClick={() => navigate(`/need/${need.id}`)}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            {/* Green accent bar at top */}
            <div style={{ height: '3px', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }} />
            <div style={{ padding: '0.65rem 0.85rem' }}>
                {/* Author + status row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            background: need.authorAvatar ? `url(${need.authorAvatar}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.55rem', fontWeight: 700, color: 'white'
                        }}>
                            {!need.authorAvatar && (need.author?.charAt(0) || 'N')}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>
                            {need.author || 'Anonymous'}
                        </span>
                    </div>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: statusColor,
                        background: `${statusColor}22`, padding: '0.1rem 0.4rem', borderRadius: '6px'
                    }}>
                        {statusLabel}
                    </span>
                </div>

                {/* Need title */}
                <p style={{
                    margin: '0 0 0.35rem 0', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {need.title}
                </p>

                {/* Meta: category or location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: 0.7 }}>
                    {need.category && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                            <Tag size={10} /> {need.category}
                        </span>
                    )}
                    {need.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                            <MapPin size={10} /> {need.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer tap-to-view hint */}
            <div style={{
                padding: '0.4rem 0.85rem',
                borderTop: isMe ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem',
                opacity: 0.65, fontSize: '0.68rem'
            }}>
                <ExternalLink size={10} />
                <span>View Need</span>
            </div>
        </div>
    );
};

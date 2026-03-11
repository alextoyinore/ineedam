import React from 'react';

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    // Use Math.abs or cap at zero to handle slight clock unsync
    const mins = Math.max(0, Math.floor(diff / 60000));
    
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

export const OnlineBadge = ({ lastSeenAt, showText = false, size = '10px' }) => {
    if (!lastSeenAt) return null;

    const lastSeenDate = new Date(lastSeenAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    // Strict online check: active within last 5 minutes.
    // We allow a small 1-minute future buffer for clock drift.
    const isOnline = diffInMinutes < 5 && diffInMinutes > -1;

    if (showText) {
        const statusText = isOnline ? 'Active now' : `Active ${timeAgo(lastSeenAt)}`;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOnline ? '#22c55e' : 'var(--text-muted)',
                    boxShadow: isOnline ? '0 0 8px #22c55e' : 'none'
                }} />
                <span style={{ color: isOnline ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isOnline ? 600 : 400 }}>
                    {statusText}
                </span>
            </div>
        );
    }

    if (!isOnline) return null;

    return (
        <div 
            title="Online"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid var(--bg-surface)',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
            }} 
        />
    );
};

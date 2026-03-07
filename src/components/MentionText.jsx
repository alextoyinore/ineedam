import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * A component that renders text with clickable @mentions.
 * Navigates to the mentioned user's profile.
 */
export const MentionText = ({ text, style }) => {
    const navigate = useNavigate();

    if (!text) return null;

    // Split text by mentions (requires start of line or space before @)
    const parts = text.split(/((?:^|\s)@\w+)/g);

    return (
        <p className="need-description" style={{ ...style, whiteSpace: 'pre-wrap', margin: 0 }}>
            {parts.map((part, index) => {
                const trimmedPart = part.trim();
                if (trimmedPart.startsWith('@')) {
                    const username = trimmedPart.substring(1);
                    return (
                        <React.Fragment key={index}>
                            {part.startsWith(' ') ? ' ' : ''}
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/${username}`);
                                }}
                                style={{
                                    color: 'var(--primary)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                                className="nav-link-hover"
                            >
                                @{username}
                            </span>
                        </React.Fragment>
                    );
                }
                return part;
            })}
        </p>
    );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { useAuth } from '../context/AuthContext';

export const ProfileCompletionList = () => {
    const { profile, fetchProfile } = useAuth();
    const { completionItems, completionPercentage, isComplete } = useProfileCompletion();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isComplete || !profile) return null;

    return (
        <div style={{
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="h3" style={{ fontSize: '1.05rem', margin: 0 }}>Complete Profile</h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{completionPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '6px', background: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    style={{ height: '100%', background: 'var(--primary)' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {completionItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        {item.completed ? (
                            <CheckCircle size={14} color="var(--primary)" />
                        ) : (
                            <Circle size={14} color="var(--text-muted)" />
                        )}
                        <span style={{ color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setIsEditModalOpen(true)}
                className="nav-link-hover"
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'transparent', border: 'none', color: 'var(--primary)',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    padding: '0.25rem 0', width: 'fit-content'
                }}
            >
                Edit Profile <ArrowRight size={14} />
            </button>

            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentProfile={profile}
                    onProfileUpdate={(updated) => {
                        fetchProfile(profile.id);
                    }}
                />
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, RotateCcw, MessageSquare, LayoutGrid, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { shapeNeed, updateNeedStatus } from '../lib/needsService';
import { updateReplyStatus } from '../lib/replyService';
import { motion, AnimatePresence } from 'framer-motion';

export const ArchivedContentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [archivedNeeds, setArchivedNeeds] = useState([]);
    const [archivedReplies, setArchivedReplies] = useState([]);
    const [activeTab, setActiveTab] = useState('needs');

    const loadArchivedContent = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [needsRes, repliesRes] = await Promise.all([
                supabase
                    .from('needs')
                    .select('*, profiles!needs_user_id_fkey(display_name, avatar_url, username)')
                    .eq('user_id', user.id)
                    .eq('status', 'archived')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('replies')
                    .select('*, needs(title), profiles(display_name, avatar_url, username)')
                    .eq('user_id', user.id)
                    .eq('status', 'archived')
                    .order('created_at', { ascending: false })
            ]);

            if (needsRes.error) throw needsRes.error;
            if (repliesRes.error) throw repliesRes.error;

            setArchivedNeeds((needsRes.data || []).map(shapeNeed));
            setArchivedReplies(repliesRes.data || []);
        } catch (err) {
            console.error("Error loading archived content:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArchivedContent();
    }, [user]);

    const handleUnarchiveNeed = async (needId) => {
        try {
            await updateNeedStatus(needId, 'open');
            setArchivedNeeds(prev => prev.filter(n => n.id !== needId));
        } catch (err) {
            alert("Failed to restore need");
        }
    };

    const handleUnarchiveReply = async (replyId) => {
        try {
            await updateReplyStatus(replyId, 'active'); // Assuming 'active' or similar for default
            setArchivedReplies(prev => prev.filter(r => r.id !== replyId));
        } catch (err) {
            alert("Failed to restore reply");
        }
    };

    const handleDeleteNeedPermanently = async (needId) => {
        if (!window.confirm("Are you sure? This will permanently delete the post and all its replies.")) return;
        try {
            const { error } = await supabase.from('needs').delete().eq('id', needId);
            if (error) throw error;
            setArchivedNeeds(prev => prev.filter(n => n.id !== needId));
        } catch (err) {
            alert("Failed to delete need");
        }
    };

    const handleDeleteReplyPermanently = async (replyId) => {
        if (!window.confirm("Are you sure? This will permanently delete the reply.")) return;
        try {
            const { error } = await supabase.from('replies').delete().eq('id', replyId);
            if (error) throw error;
            setArchivedReplies(prev => prev.filter(r => r.id !== replyId));
        } catch (err) {
            alert("Failed to delete reply");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <header className="sticky-header" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>Archived Content</h2>
            </header>

            <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '1rem' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setActiveTab('needs')}
                        style={{
                            flex: 1, padding: '1rem', fontWeight: 600,
                            color: activeTab === 'needs' ? 'var(--primary)' : 'var(--text-muted)',
                            border: 'none', background: 'transparent', borderBottom: activeTab === 'needs' ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Needs ({archivedNeeds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('replies')}
                        style={{
                            flex: 1, padding: '1rem', fontWeight: 600,
                            color: activeTab === 'replies' ? 'var(--primary)' : 'var(--text-muted)',
                            border: 'none', background: 'transparent', borderBottom: activeTab === 'replies' ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Replies ({archivedReplies.length})
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                        <Loader size={32} className="animate-spin" />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeTab === 'needs' ? (
                            archivedNeeds.length > 0 ? (
                                archivedNeeds.map(need => (
                                    <div key={need.id} style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <LayoutGrid size={16} color="var(--primary)" />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                                                    {need.category}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '1.1rem' }}>{need.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {need.description}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                            <button
                                                onClick={() => handleUnarchiveNeed(need.id)}
                                                className="glass-panel-hover"
                                                style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                title="Restore Post"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNeedPermanently(need.id)}
                                                className="glass-panel-hover"
                                                style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                title="Delete Permanently"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<LayoutGrid size={48} />} title="No archived needs" />
                            )
                        ) : (
                            archivedReplies.length > 0 ? (
                                archivedReplies.map(reply => (
                                    <div key={reply.id} style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <MessageSquare size={16} color="var(--secondary)" />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Reply to: <span style={{ fontWeight: 600 }}>{reply.needs?.title}</span>
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{reply.content}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                            <button
                                                onClick={() => handleUnarchiveReply(reply.id)}
                                                className="glass-panel-hover"
                                                style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                title="Restore Reply"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReplyPermanently(reply.id)}
                                                className="glass-panel-hover"
                                                style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                title="Delete Permanently"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<MessageSquare size={48} />} title="No archived replies" />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title }) => (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ opacity: 0.2 }}>{icon}</div>
        <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Items you archive will appear here.</p>
    </div>
);

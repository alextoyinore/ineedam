import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Settings, Edit3, CheckCircle, Trash2, ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { NeedCard } from '../components/NeedCard';
import { useSocial } from '../context/SocialContext';

export const UserDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('needs');
    const { following } = useSocial();

    // Mock data for user's posted needs
    const myNeeds = [
        { id: '1', title: 'Need a Full-Stack Developer for MVP', category: 'Service', status: 'Active', postedAt: '2 days ago', budget: '$3,000 - $5,000', location: 'Remote', flexibility: 'Flexible', author: 'Alex T.', description: 'Looking for an experienced dev to help build...' },
        { id: '2', title: 'Language Tutor for Conversational Spanish', category: 'Training', status: 'Met', postedAt: '2 weeks ago', budget: '$25/hr', location: 'Online', flexibility: 'Flexible', author: 'Alex T.', description: 'Need someone to practice conversational spanish 2x a week.' }
    ];

    // Mock replies / messages logic
    const myReplies = [
        { id: 'r1', author: 'Sarah J.', content: 'I would love to help with this. Is the budget firm?', time: '2h ago', needTitle: 'Need a Full-Stack Developer for MVP' },
        { id: 'r2', author: 'Miguel R.', content: 'Perfect, see you on Tuesday!', time: '1 week ago', needTitle: 'Language Tutor for Conversational Spanish' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Sticky Header */}
            <header className="sticky-header" style={{
                padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
                <button onClick={() => window.history.back()} style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-primary)' }} className="glass-panel-hover">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>Alex T.</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{myNeeds.length} posts</span>
                </div>
            </header>

            {/* Profile Hero / Cover */}
            <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} />

            {/* Profile Info */}
            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Floating Avatar */}
                    <div style={{
                        width: '130px', height: '130px', borderRadius: '50%',
                        background: 'var(--bg-surface)', border: '4px solid var(--bg-base)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '3rem',
                        marginTop: '-65px'
                    }}>
                        A
                    </div>

                    <button className="btn btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 600 }}>
                        Edit profile
                    </button>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <h1 className="h1" style={{ fontSize: '1.5rem', margin: 0 }}>Alex T.</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 1rem 0' }}>@alext</p>

                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Software enthusiast always looking for interesting projects and learning opportunities. Building the future one need at a time.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> San Francisco, CA</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> Joined February 2026</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>{following.length}</strong> Following</span>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>48</strong> Followers</span>
                        <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>12</strong> Met Needs</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
                {['needs', 'replies', 'following', 'followers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1, padding: '1rem', fontWeight: 600, fontSize: '0.9rem',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                            position: 'relative', transition: 'background-color 0.2s',
                            textTransform: 'capitalize'
                        }}
                        className="nav-link-hover"
                    >
                        {tab === 'needs' ? 'Posts' : tab}
                        {activeTab === tab && (
                            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '4px', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'needs' && myNeeds.map((need, idx) => (
                    <motion.div
                        key={need.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
                        className="nav-link-hover"
                    >
                        <NeedCard need={need} />
                        {/* Status specific actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingLeft: '3.25rem' }}>
                            <span style={{
                                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                background: need.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                color: need.status === 'Active' ? '#10b981' : 'var(--text-secondary)',
                                border: '1px solid var(--border-glass)'
                            }}>
                                {need.status}
                            </span>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '9999px' }}>Edit</button>
                            {need.status === 'Active' && <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#10b981', borderRadius: '9999px' }}>Mark Fulfilled</button>}
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderRadius: '9999px', marginLeft: 'auto' }}>Delete</button>
                        </div>
                    </motion.div>
                ))}

                {activeTab === 'replies' && myReplies.map((reply, idx) => (
                    <div
                        key={reply.id}
                        className="nav-link-hover"
                        style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid var(--border-glass)',
                            display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer',
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>
                            {reply.author.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reply.author}</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>• {reply.time}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Replying to <span style={{ color: 'var(--primary)' }}>Alex T.'s</span> need "{reply.needTitle}"
                            </p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {reply.content}
                            </p>
                        </div>
                    </div>
                ))}

                {(activeTab === 'following' || activeTab === 'followers') && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 className="h3" style={{ color: 'var(--text-primary)' }}>
                            {activeTab === 'following' ? `You are following ${following.length} users` : "You have 48 followers"}
                        </h3>
                        {activeTab === 'following' && following.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', textAlign: 'left' }}>
                                {following.map(user => (
                                    <div key={user} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {user.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700 }}>{user}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user.toLowerCase().replace(' ', '')}</div>
                                        </div>
                                        <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '9999px' }}>Following</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}

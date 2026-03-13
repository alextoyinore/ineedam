import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Zap, Shield, HelpCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VideoIntroPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Users size={24} className="text-primary" />,
            title: "Build Your Network",
            description: "Connect with professionals, mentors, and peers in a dynamic, open community designed to foster collaboration."
        },
        {
            icon: <Zap size={24} className="text-primary" />,
            title: "Broadcast Your Needs",
            description: "Have a question or need resources? Broadcast it instantly to your network and get immediate, actionable responses."
        },
        {
            icon: <Shield size={24} className="text-primary" />,
            title: "Endorse and Be Endorsed",
            description: "Show appreciation for helpful peers through our Endorsement system. Build your reputation securely."
        },
        {
            icon: <HelpCircle size={24} className="text-primary" />,
            title: "Private Threads",
            description: "Take conversations private when needed with PIN-protected, secure direct messaging and multimedia attachments."
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>
            {/* Header */}
            <header className="sticky-header" style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: 'var(--feed-item-padding)',
                borderBottom: '1px solid var(--border-glass)',
                background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '50%',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 className="h2" style={{ margin: 0, fontSize: '1.25rem' }}>Welcome to Ineedam</h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Discover what you can do</span>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem var(--feed-item-padding)', maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                
                {/* Hero / Video Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}
                >
                    <div style={{ maxWidth: '600px' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            The fastest way to <span style={{ color: 'var(--primary)' }}>connect and collaborate.</span>
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            Watch the video below to discover how Ineedam empowers you to broadcast your needs, build reputation, and chat securely.
                        </p>
                    </div>

                    {/* Premium Glass Video Player Wrapper */}
                    <div style={{
                        width: '100%',
                        maxWidth: '800px',
                        aspectRatio: '16/9',
                        borderRadius: '24px',
                        background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-base))',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        group: 'true'
                    }}>
                        {/* Placeholder Content - Replace src with actual video URL when ready */}
                        <video 
                            controls
                            poster="/favicon.png" // Temporary placeholder poster
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                        >
                            {/* <source src="YOUR_VIDEO_URL.mp4" type="video/mp4" /> */}
                            Your browser does not support the video tag.
                        </video>

                        {/* Visual Overlay if no video is loaded (optional, remove once video is added) */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: '1rem', color: 'white', pointerEvents: 'none'
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
                            }}>
                                <Play size={36} fill="white" style={{ marginLeft: '4px' }} />
                            </div>
                            <span style={{ fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', opacity: 0.9 }}>Video Coming Soon</span>
                        </div>
                    </div>
                </motion.section>

                {/* Features Grid */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem'
                    }}>
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                style={{
                                    background: 'var(--bg-surface)',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    border: '1px solid var(--border-glass)',
                                    display: 'flex', flexDirection: 'column', gap: '1rem',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                            >
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

            </main>
        </div>
    );
};

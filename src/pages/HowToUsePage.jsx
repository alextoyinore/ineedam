import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Sparkles, AlertCircle, Search, MessageSquare, Send } from 'lucide-react';

const UseCaseSection = ({ title, items, icon: Icon, color = 'var(--primary)' }) => (
    <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `color-mix(in srgb, ${color}, transparent 90%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
            }}>
                <Icon size={24} />
            </div>
            <h2 className="h2" style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {items.map((item, idx) => (
                <div key={idx} style={{
                    padding: '1.5rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    transition: 'transform 0.2s'
                }} className="glass-panel-hover">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
                </div>
            ))}
        </div>
    </div>
);

export const HowToUsePage = () => {
    const obviousCases = [
        { title: "Finding Services", description: "Need a plumber, local electrician, or a dog walker? Post your location and budget, and let local experts come to you." },
        { title: "Tech & Development", description: "Looking for a React developer or a UI designer? Skip recruiter fees and broadcast your specific project needs." },
        { title: "Buying Products", description: "Searching for a specific laptop model or a rare collectible? Tell the community what you're willing to pay." },
        { title: "Local Errands", description: "Need someone to pick up a prescription, drop off dry cleaning, or do a quick grocery run? Your neighbors can help." }
    ];

    const cleverCases = [
        { title: "Relocation Assistance", description: "Need help unpacking boxes for 3 hours or moving a specialized item? Perfect for high-intensity, short-duration tasks." },
        { title: "Lost & Found", description: "Lost a pet or an heirloom? Broadcast the details to the community for a much larger set of eyes than a telephone pole flyer." },
        { title: "Skill Exchange", description: "Need to learn Photoshop but can teach Guitar? Post it as a 'Service' need and find a local barter partner." },
        { title: "Event Planning", description: "Looking for a venue that allows outside catering for 15 people? Broadcasters give you options you won't find on Google." }
    ];

    const edgeCases = [
        { title: "Market Validation", description: "Thinking of starting a service? Post a 'Need' for it to see how many professionals exist and what they're charging." },
        { title: "Emergency Support", description: "Car won't start or basement flooded? Ineedam connects you to helpers faster than traditional directory searches." },
        { title: "Research Help", description: "Need someone to find a specific out-of-print book or local data point? Crowdsource the research to local experts." },
        { title: "Tool & Rental Hub", description: "Need a hammer drill for just one hour? Post a need to borrow or rent it from someone nearby instead of buying new." }
    ];

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="h1" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Use Cases</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Ineedam turns the marketplace upside down. Here are real ways people use the power of demand.
                    </p>
                </header>

                <div style={{ marginBottom: '4rem' }}>
                    <h2 className="h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>The Three-Step Flow</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: Send, title: "1. Post Your Need", desc: "Be descriptive. Mention budget, location, and any specific constraints you have." },
                            { icon: MessageSquare, title: "2. Receive Replies", desc: "Interested providers will reply publicly or start a private chat directly with you." },
                            { icon: Sparkles, title: "3. Mark as Met", desc: "Once satisfied, mark the need as 'Met' and tag the person who helped you." }
                        ].map((step, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
                                <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <step.icon size={32} />
                                </div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{step.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <UseCaseSection
                    title="The Obvious"
                    icon={Target}
                    items={obviousCases}
                />

                <UseCaseSection
                    title="The Clever"
                    icon={Lightbulb}
                    color="var(--secondary)"
                    items={cleverCases}
                />

                <UseCaseSection
                    title="The 'Not So Obvious'"
                    icon={AlertCircle}
                    color="var(--accent)"
                    items={edgeCases}
                />

                <div style={{
                    marginTop: '2rem',
                    padding: '3rem',
                    borderRadius: '32px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-base)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to start?</h2>
                    <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>
                        The community is waiting to fill your next need.
                    </p>
                    <a href="/" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Go to Explore
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

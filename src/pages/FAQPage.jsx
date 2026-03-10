import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Shield, CreditCard, User, Hand, Award } from 'lucide-react';

const FAQItem = ({ question, answer, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            marginBottom: '1rem',
            overflow: 'hidden',
            transition: 'all 0.2s'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0
                }}>
                    <Icon size={18} />
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--text-muted)' }}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div style={{
                            padding: '0 1.5rem 1.5rem 4.25rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6,
                            fontSize: '0.95rem'
                        }}>
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FAQPage = () => {
    const faqs = [
        {
            icon: HelpCircle,
            question: "What is Ineedam?",
            answer: "Ineedam is a demand-driven marketplace. Instead of browsing listings of what people are selling, you post exactly what you need, and the people who can provide it find you."
        },
        {
            icon: User,
            question: "Is it free to use?",
            answer: "Yes! Creating an account, posting needs, and replying to others is completely free. We focus on connecting people directly."
        },
        {
            icon: MessageCircle,
            question: "How do I reply to a need?",
            answer: "Simply click the 'Reply' button on any need card. You can choose to post a public reply (visible to everyone) or a private proposal (visible only to the poster). You can also attach files or images to your reply."
        },
        {
            icon: Shield,
            question: "How can I trust other users?",
            answer: "We focus on community transparency. You can view user profiles, see their 'Fulfilled Requests' count, read their bio, and check endorsements written about them before engaging."
        },
        {
            icon: CreditCard,
            question: "How do payments work?",
            answer: "Ineedam is a connection platform. We do not process payments directly yet. You and the service provider should agree on payment methods outside the platform."
        },
        {
            icon: MessageCircle,
            question: "How does the private messaging (DMs) work?",
            answer: "You can message any user directly by visiting their profile and tapping the Message button. Conversations are private and only visible to you and the recipient. You can send text, voice notes, images, video, and other files in DMs."
        },
        {
            icon: Shield,
            question: "Can I protect my messages with a PIN?",
            answer: "Yes! You can set a PIN in your profile settings under 'Message PIN'. After 1 minute of inactivity or when you switch pages, your messages will be locked automatically and require your PIN to access."
        },
        {
            icon: MessageCircle,
            question: "What are Endorsements?",
            answer: "When a need is fulfilled, the poster can formally endorse the person who helped them. Endorsements are public and appear on the helper's profile as a trust signal for the rest of the community."
        },
        {
            icon: HelpCircle,
            question: "What is the Broadcast feature?",
            answer: "Broadcast lets you share a need or endorsement with your followers, similar to a repost. It helps needs reach a wider audience and helps great providers get more visibility."
        },
        {
            icon: HelpCircle,
            question: "Can I save content for later?",
            answer: "Yes. You can bookmark any need, endorsement, or even individual chat messages. All your bookmarks are accessible from the Bookmarks tab in the navigation."
        },
        {
            icon: MessageCircle,
            question: "Can I attach files to messages and replies?",
            answer: "Yes! You can attach images, videos, PDFs, and other documents to both direct messages and need replies. Attachments can be previewed in-app by tapping on them — videos play directly, images open in a full-screen viewer."
        },
        {
            icon: HelpCircle,
            question: "How do I invite friends to Ineedam?",
            answer: "Tap 'Invite Friends' in the sidebar (desktop) or the menu drawer (mobile). You can share an invite via WhatsApp, Telegram, Email, SMS, or by copying the link directly."
        },
        {
            icon: Hand,
            question: "How do I show interest in a need without messaging?",
            answer: "Click the 'Raised Hand' icon on any need to privately signal to the poster that you are interested and able to help. They will receive an instant notification."
        },
        {
            icon: Award,
            question: "How does the Leaderboard work?",
            answer: "The Leaderboard ranks our most engaged community members. You earn points and climb the ranks when someone endorses you for fulfilling a need, and when you reply to help others."
        },
        {
            icon: MessageCircle,
            question: "What does the Response Rate on a profile mean?",
            answer: "The Response Rate badge shows how reliably a user replies to helpers on their posts within 48 hours. A high percentage means they are active and communicate well with the community."
        }
    ];

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="h1" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Frequently Asked Questions</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Everything you need to know about how Ineedam works.
                    </p>
                </header>

                <div>
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} {...faq} />
                    ))}
                </div>

                <div style={{
                    marginTop: '4rem',
                    padding: '2rem',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                    border: '1px solid var(--border-glass)',
                    textAlign: 'center'
                }}>
                    <h3 className="h3" style={{ marginBottom: '1rem' }}>Still have questions?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        We're here to help you get the most out of the platform.
                    </p>
                    <a href="mailto:support@ineedam.com" className="btn btn-primary">
                        Contact Support
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

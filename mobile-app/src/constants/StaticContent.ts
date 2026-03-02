import { Target, Users, Zap, ShieldCheck, HelpCircle, Book, Shield, FileText, Lightbulb, AlertCircle, Send, MessageSquare, Sparkles, User, CreditCard, MessageCircle } from 'lucide-react-native';

export const STATIC_PAGES: Record<string, any> = {
    about: {
        title: 'About Ineedam',
        subtitle: 'The Marketplace of Demand',
        heroText: 'Ineedam was born from a simple realization: the internet is great at showing you what\'s for sale, but terrible at helping you find what you actually need.',
        sections: [
            {
                type: 'grid',
                items: [
                    {
                        icon: Target,
                        title: 'Demand First',
                        text: 'We flip the script. Instead of vendors screaming for attention, we empower seekers to broadcast their needs clearly.'
                    },
                    {
                        icon: Users,
                        title: 'Community Driven',
                        text: 'Real people, real solutions. We believe the local community is the most powerful solved-state for any problem.'
                    }
                ]
            },
            {
                type: 'text',
                title: 'Our Story',
                content: `We started Ineedam in 2026 after seeing countless friends struggle to find specialized help that didn't fit into a standard "service" box. Whether it was someone needing help moving a sofa two blocks away, or a developer looking for a very specific API integration expert, the search was always fragmented across social media, forums, and local boards.\n\nIneedam provides a unified beacon for these needs. It's a place where the "not quite standard" becomes standard. By allowing users to tag helpers and build a reputation based on fulfillment, we're building a trust layer for the modern gig economy.`
            },
            {
                type: 'values',
                title: 'What we stand for',
                items: [
                    {
                        icon: Zap,
                        title: 'Transparency',
                        text: 'No hidden fees or algorithms prioritizing paid listings. Real needs, visible to all.'
                    },
                    {
                        icon: ShieldCheck,
                        title: 'Trust',
                        text: 'A reputation system built on actual fulfillment and community validation.'
                    }
                ]
            }
        ]
    },
    faq: {
        title: 'Frequently Asked Questions',
        sections: [
            {
                type: 'faq',
                items: [
                    {
                        icon: HelpCircle,
                        q: 'What is Ineedam?',
                        a: 'Ineedam is a demand-driven marketplace. Instead of browsing listings of what people are selling, you post exactly what you need, and the people who can provide it find you.'
                    },
                    {
                        icon: User,
                        q: 'Is it free to use?',
                        a: 'Yes! Creating an account, posting needs, and replying to others is completely free. We focus on connecting people directly.'
                    },
                    {
                        icon: MessageCircle,
                        q: 'How do I reply to a need?',
                        a: 'Simply tap the \'Reply\' button on any need card. You can choose to post a public reply or a private proposal.'
                    },
                    {
                        icon: Shield,
                        q: 'How can I trust other users?',
                        a: 'We focus on community transparency. You can view user profiles, see their \'Fulfilled Requests\' count, and read their bio before engaging.'
                    },
                    {
                        icon: CreditCard,
                        q: 'How do payments work?',
                        a: 'Ineedam is a connection platform. We do not process payments directly yet. You and the service provider should agree on payment methods outside the platform.'
                    }
                ]
            }
        ]
    },
    howtouse: {
        title: 'How to use Ineedam',
        heroText: 'Ineedam turns the marketplace upside down. Here is how you can leverage the power of demand.',
        sections: [
            {
                type: 'grid',
                title: 'The Three-Step Flow',
                items: [
                    { icon: Send, title: '1. Post Your Need', text: 'Be descriptive. Mention budget, location, and any specific constraints you have.' },
                    { icon: MessageSquare, title: '2. Receive Replies', text: 'Interested providers will reply publicly or send private proposals directly to you.' },
                    { icon: Sparkles, title: '3. Mark as Met', text: 'Once satisfied, mark the need as \'Met\' and tag the person who helped you.' }
                ]
            },
            {
                type: 'grid',
                title: 'The Obvious',
                items: [
                    { title: "Finding Services", text: "Need a plumber, local electrician, or a dog walker? Post your location and budget, and let local experts come to you." },
                    { title: "Tech & Development", text: "Looking for a React developer or a UI designer? Skip the recruiter fees and broadcast your specific project needs." }
                ]
            },
            {
                type: 'grid',
                title: 'The Clever',
                items: [
                    { title: "Relocation Assistance", text: "Need help unpacking boxes for 3 hours or a specialized item moved? It's the perfect place for high-intensity, short-duration tasks." },
                    { title: "Skill Exchange", text: "Need to learn Photoshop but can teach Guitar? Post it as a 'Service' need and find a barter partner." }
                ]
            }
        ]
    },
    rules: {
        title: 'Rules of Engagement',
        heroText: 'Welcome to iNeedam! To ensure a safe, respectful, and productive environment for everyone, we ask all users to adhere to the following rules.',
        sections: [
            {
                type: 'text',
                title: '1. Platform Etiquette',
                content: '• Be Respectful: Treat everyone with kindness and respect. Harassment, hate speech, and abusive language are strictly prohibited.\n• Stay on Topic: Keep your needs, offers, and replies relevant.\n• Honesty and Transparency: Be truthful about your needs and what you can offer.\n• Respect Privacy: Do not share personal information of others without their explicit consent.'
            },
            {
                type: 'text',
                title: '2. Personal Safety',
                content: '• Meet in Public: Always arrange to meet in well-lit, public locations.\n• Bring a Friend: Whenever possible, do not go alone to a meetup.\n• Inform Others: Tell someone you trust where you are going.\n• Trust Your Instincts: If a situation makes you feel uncomfortable, leave immediately.'
            }
        ]
    },
    privacy: {
        title: 'Privacy Policy',
        heroText: 'Last updated: October 2026',
        sections: [
            {
                type: 'text',
                title: '1. Information We Collect',
                content: 'We collect information you provide directly to us when you create an account, post a need, reply to a thread, or otherwise communicate with us.'
            },
            {
                type: 'text',
                title: '2. How We Use Your Information',
                content: 'We use the information we collect to operate, maintain, and provide the features and functionality of the Service.'
            }
        ]
    },
    terms: {
        title: 'Terms of Service',
        heroText: 'Last updated: October 2026',
        sections: [
            {
                type: 'text',
                title: '1. Acceptance of Terms',
                content: 'By accessing or using Ineedam, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.'
            },
            {
                type: 'text',
                title: '2. Content and Conduct',
                content: 'Our Service allows you to post, link, store, share and otherwise make available certain information. You are responsible for the Content that you post.'
            }
        ]
    }
};

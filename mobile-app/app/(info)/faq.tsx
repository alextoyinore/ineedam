import React, { useState } from 'react';
import {
    StyleSheet, View, Text, ScrollView,
    TouchableOpacity, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';


const FAQS = [
    {
        emoji: '❓',
        question: 'What is Ineedam?',
        answer: 'Ineedam is a demand-driven marketplace. Instead of browsing listings of what people are selling, you post exactly what you need, and the people who can provide it find you.',
    },
    {
        emoji: '👤',
        question: 'Is it free to use?',
        answer: 'Yes! Creating an account, posting needs, and replying to others is completely free. We focus on connecting people directly.',
    },
    {
        emoji: '💬',
        question: 'How do I reply to a need?',
        answer: "Simply tap the 'Reply' button on any need card. You can choose to post a public reply (visible to everyone) or a private proposal (visible only to the poster).",
    },
    {
        emoji: '🛡️',
        question: 'How can I trust other users?',
        answer: "We focus on community transparency. You can view user profiles, see their 'Fulfilled Requests' count (how many times they've helped others), and read their bio before engaging.",
    },
    {
        emoji: '💳',
        question: 'How do payments work?',
        answer: 'Ineedam is a connection platform. We do not process payments directly yet. You and the service provider should agree on payment methods outside the platform.',
    },
];

function FAQItem({ faq, theme }: { faq: typeof FAQS[0]; theme: 'light' | 'dark' }) {
    const [open, setOpen] = useState(false);
    const colors = Colors[theme];

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(!open);
    };

    return (
        <TouchableOpacity
            onPress={toggle}
            activeOpacity={0.8}
            style={[styles.faqItem, {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            }]}
        >
            <View style={styles.faqHeader}>
                <View style={[styles.iconBadge, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={styles.faqEmoji}>{faq.emoji}</Text>
                </View>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Text style={[styles.chevron, { color: colors.icon }]}>{open ? '▲' : '▼'}</Text>
            </View>
            {open && (
                <Text style={[styles.faqAnswer, { color: colors.icon }]}>{faq.answer}</Text>
            )}
        </TouchableOpacity>
    );
}

export default function FAQScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'FAQ' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.h1, { color: colors.text }]}>Frequently Asked Questions</Text>
            <Text style={[styles.lead, { color: colors.icon }]}>
                Everything you need to know about how Ineedam works.
            </Text>

            <View style={styles.list}>
                {FAQS.map((faq, i) => (
                    <FAQItem key={i} faq={faq} theme={theme} />
                ))}
            </View>

            {/* Still have questions */}
            <View style={[styles.ctaBox, {
                backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                borderColor: theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
            }]}>
                <Text style={[styles.ctaTitle, { color: colors.text }]}>Still have questions?</Text>
                <Text style={[styles.ctaDesc, { color: colors.icon }]}>
                    We're here to help you get the most out of the platform.
                </Text>
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: colors.tint }]}
                    onPress={() => {
                        const { Linking } = require('react-native');
                        Linking.openURL('mailto:support@ineedam.com');
                    }}
                >
                    <Text style={styles.ctaButtonText}>Contact Support</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48 },
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
    lead: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
    list: { gap: 10 },
    faqItem: { borderRadius: 16, borderWidth: 1, padding: 16, overflow: 'hidden' },
    faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    faqEmoji: { fontSize: 18 },
    faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 20 },
    chevron: { fontSize: 11, fontWeight: '700' },
    faqAnswer: { marginTop: 12, fontSize: 14, lineHeight: 22, paddingLeft: 48 },
    ctaBox: { marginTop: 28, borderRadius: 20, borderWidth: 1, padding: 22, alignItems: 'center' },
    ctaTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    ctaDesc: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 18 },
    ctaButton: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 },
    ctaButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

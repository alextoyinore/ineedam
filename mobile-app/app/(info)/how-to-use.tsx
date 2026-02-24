import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';

const STEPS = [
    { emoji: '📤', title: '1. Post Your Need', desc: 'Be descriptive. Mention budget, location, and any specific constraints you have.' },
    { emoji: '💬', title: '2. Receive Replies', desc: 'Interested providers will reply publicly or send private proposals directly to you.' },
    { emoji: '✅', title: '3. Mark as Met', desc: "Once satisfied, mark the need as 'Met' and tag the person who helped you." },
];

const OBVIOUS = [
    { title: 'Finding Services', desc: 'Need a plumber, local electrician, or a dog walker? Post your location and budget, and let local experts come to you.' },
    { title: 'Tech & Development', desc: 'Looking for a React developer or a UI designer? Skip the recruiter fees and broadcast your specific project needs.' },
    { title: 'Buying Products', desc: "Searching for a specific laptop model or a rare collectible? Tell the community what you're willing to pay." },
];

const CLEVER = [
    { title: 'Relocation Assistance', desc: 'Need help unpacking boxes for 3 hours or a specialized item moved? Perfect for high-intensity, short-duration tasks.' },
    { title: 'Skill Exchange', desc: 'Need to learn Photoshop but can teach Guitar? Post it as a "Service" need and find a barter partner.' },
    { title: 'Event Planning', desc: 'Looking for a venue that allows outside catering for 15 people? Broadcasters give you options you won\'t find on Google.' },
];

const NOT_OBVIOUS = [
    { title: 'Market Validation', desc: 'Thinking of starting a service? Post a "Need" for it to see how many professionals exist and what they\'re charging.' },
    { title: 'Research Help', desc: 'Need someone to find a specific out-of-print book or data point? Crowdsource the research to someone with the time.' },
    { title: 'Emergency Backup', desc: "Phone died and you're stranded? Post a quick need for a jump-start or a charger if you can get online." },
];

function SectionCards({ items, theme }: { items: { title: string; desc: string }[]; theme: 'light' | 'dark' }) {
    const colors = Colors[theme];
    return (
        <View style={styles.cardList}>
            {items.map((item, i) => (
                <View key={i} style={[styles.useCard, {
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.cardDesc, { color: colors.icon }]}>{item.desc}</Text>
                </View>
            ))}
        </View>
    );
}

export default function HowToUseScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();
    const router = useRouter();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'How to Use' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.h1, { color: colors.text }]}>How to Use Ineedam</Text>
            <Text style={[styles.lead, { color: colors.icon }]}>
                Ineedam turns the marketplace upside down. Here's how you can leverage the power of demand.
            </Text>

            {/* Three-Step Flow */}
            <Text style={[styles.h2, { color: colors.text }]}>The Three-Step Flow</Text>
            <View style={styles.stepsRow}>
                {STEPS.map((step, i) => (
                    <View key={i} style={[styles.stepCard, {
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }]}>
                        <Text style={styles.stepEmoji}>{step.emoji}</Text>
                        <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                        <Text style={[styles.stepDesc, { color: colors.icon }]}>{step.desc}</Text>
                    </View>
                ))}
            </View>

            {/* Use Cases */}
            <Text style={[styles.h2, { color: colors.text }]}>🎯 The Obvious</Text>
            <SectionCards items={OBVIOUS} theme={theme} />

            <Text style={[styles.h2, { color: colors.text }]}>💡 The Clever</Text>
            <SectionCards items={CLEVER} theme={theme} />

            <Text style={[styles.h2, { color: colors.text }]}>🔍 The "Not So Obvious"</Text>
            <SectionCards items={NOT_OBVIOUS} theme={theme} />

            {/* CTA */}
            <View style={[styles.ctaBox, { backgroundColor: colors.text }]}>
                <Text style={[styles.ctaTitle, { color: colors.background }]}>Ready to start?</Text>
                <Text style={[styles.ctaDesc, { color: colors.background, opacity: 0.75 }]}>
                    The community is waiting to fill your next need.
                </Text>
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: colors.tint }]}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={styles.ctaButtonText}>Go to Explore</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48, gap: 14 },
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    h2: { fontSize: 20, fontWeight: '700', marginTop: 8 },
    lead: { fontSize: 15, lineHeight: 22 },
    stepsRow: { gap: 10 },
    stepCard: { borderRadius: 16, borderWidth: 1, padding: 18, alignItems: 'center' },
    stepEmoji: { fontSize: 28, marginBottom: 8 },
    stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
    stepDesc: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
    cardList: { gap: 10 },
    useCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
    cardDesc: { fontSize: 13, lineHeight: 20 },
    ctaBox: { borderRadius: 20, padding: 28, alignItems: 'center', marginTop: 8 },
    ctaTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
    ctaDesc: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    ctaButton: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 },
    ctaButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

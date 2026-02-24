import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

const InfoCard = ({ children, theme }: { children: React.ReactNode; theme: 'light' | 'dark' }) => (
    <View style={[styles.card, {
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    }]}>
        {children}
    </View>
);

export default function AboutScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'About' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Hero */}
            <Text style={[styles.h1, { color: colors.text }]}>
                The Marketplace of{' '}
                <Text style={{ color: colors.tint }}>Demand</Text>
            </Text>
            <Text style={[styles.lead, { color: colors.icon }]}>
                Ineedam was born from a simple realization: the internet is great at showing you what's for sale, but terrible at helping you find what you actually need.
            </Text>

            {/* Core Cards */}
            <View style={styles.cardsRow}>
                <InfoCard theme={theme}>
                    <Text style={styles.cardEmoji}>🎯</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Demand First</Text>
                    <Text style={[styles.cardDesc, { color: colors.icon }]}>
                        We flip the script. Instead of vendors screaming for attention, we empower seekers to broadcast their needs clearly.
                    </Text>
                </InfoCard>
                <InfoCard theme={theme}>
                    <Text style={styles.cardEmoji}>👥</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Community Driven</Text>
                    <Text style={[styles.cardDesc, { color: colors.icon }]}>
                        Real people, real solutions. We believe the local community is the most powerful solved-state for any problem.
                    </Text>
                </InfoCard>
            </View>

            {/* Our Story */}
            <Text style={[styles.h2, { color: colors.text }]}>Our Story</Text>
            <Text style={[styles.body, { color: colors.icon }]}>
                We started Ineedam in 2026 after seeing countless friends struggle to find specialized help that didn't fit into a standard "service" box. Whether it was someone needing help moving a sofa two blocks away, or a developer looking for a very specific API integration expert, the search was always fragmented across social media, forums, and local boards.
            </Text>
            <Text style={[styles.body, { color: colors.icon, marginTop: 12 }]}>
                Ineedam provides a unified beacon for these needs. It's a place where the "not quite standard" becomes standard. By allowing users to tag helpers and build a reputation based on fulfillment, we're building a trust layer for the modern gig economy.
            </Text>

            {/* Values */}
            <View style={[styles.valuesSection, {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            }]}>
                <Text style={[styles.h2, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>What We Stand For</Text>
                <View style={styles.valueRow}>
                    <Text style={styles.valueEmoji}>⚡</Text>
                    <View style={styles.valueText}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Transparency</Text>
                        <Text style={[styles.cardDesc, { color: colors.icon }]}>No hidden fees or algorithms prioritizing paid listings. Real needs, visible to all.</Text>
                    </View>
                </View>
                <View style={[styles.valueRow, { marginTop: 16 }]}>
                    <Text style={styles.valueEmoji}>🛡️</Text>
                    <View style={styles.valueText}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Trust</Text>
                        <Text style={[styles.cardDesc, { color: colors.icon }]}>A reputation system built on actual fulfillment and community validation.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48, gap: 16 },
    h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, lineHeight: 38, marginBottom: 4 },
    h2: { fontSize: 22, fontWeight: '700', marginTop: 8 },
    lead: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
    body: { fontSize: 15, lineHeight: 24 },
    cardsRow: { gap: 12, marginVertical: 8 },
    card: { borderRadius: 16, borderWidth: 1, padding: 18 },
    cardEmoji: { fontSize: 24, marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    cardDesc: { fontSize: 14, lineHeight: 21 },
    valuesSection: { borderRadius: 20, borderWidth: 1, padding: 20, marginTop: 8 },
    valueRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    valueEmoji: { fontSize: 22, marginTop: 2 },
    valueText: { flex: 1 },
});

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

const Section = ({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) => (
    <View style={styles.section}>
        <Text style={[styles.h2, { color: colors.text }]}>{title}</Text>
        {children}
    </View>
);

export default function TermsScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'Terms of Service' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.h1, { color: colors.text }]}>Terms of Service</Text>
            <Text style={[styles.meta, { color: colors.icon }]}>Last updated: October 2026</Text>

            <Section title="1. Acceptance of Terms" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    By accessing or using Ineedam, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                </Text>
            </Section>

            <Section title="2. Content and Conduct" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                </Text>
                <Text style={[styles.body, { color: colors.icon, marginTop: 14 }]}>
                    You agree not to post any Content that is unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms.
                </Text>
            </Section>

            <Section title="3. Termination" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </Text>
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48, gap: 4 },
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    meta: { fontSize: 13, marginBottom: 12 },
    section: { marginTop: 24 },
    h2: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
    body: { fontSize: 15, lineHeight: 24 },
});

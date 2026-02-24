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

export default function PrivacyScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'Privacy Policy' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.h1, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.meta, { color: colors.icon }]}>Last updated: October 2026</Text>

            <Section title="1. Information We Collect" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    We collect information you provide directly to us when you create an account, post a need, reply to a thread, or otherwise communicate with us. This includes your name, email address, and the contents of your posts.
                </Text>
            </Section>

            <Section title="2. How We Use Your Information" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    We use the information we collect to operate, maintain, and provide the features and functionality of the Service. We also use this information to communicate with you and personalize your experience.
                </Text>
            </Section>

            <Section title="3. Data Sharing and Disclosure" colors={colors}>
                <Text style={[styles.body, { color: colors.icon }]}>
                    Your posted needs and replies are public and visible to anyone on the platform. We do not sell your personal information to third parties. We may share anonymous/aggregated data for analytics purposes.
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

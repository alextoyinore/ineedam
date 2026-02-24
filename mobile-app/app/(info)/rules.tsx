import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

const BulletItem = ({ bold, text, colors }: { bold: string; text: string; colors: any }) => (
    <View style={styles.bulletRow}>
        <Text style={[styles.bulletDot, { color: colors.tint }]}>•</Text>
        <Text style={[styles.bulletText, { color: colors.icon }]}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{bold} </Text>
            {text}
        </Text>
    </View>
);

export default function RulesScreen() {
    const theme = useColorScheme();
    const colors = Colors[theme];
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: 'Rules of Engagement' });
    }, [navigation]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.h1, { color: colors.text }]}>Rules of Engagement</Text>
            <Text style={[styles.intro, { color: colors.icon }]}>
                Welcome to iNeedam! To ensure a safe, respectful, and productive environment for everyone, we ask all users to adhere to the following rules, both on our platform and when engaging with others in the physical world.
            </Text>

            {/* Section 1 */}
            <Text style={[styles.h2, { color: colors.text }]}>1. Platform Etiquette</Text>
            <View style={styles.bullets}>
                <BulletItem bold="Be Respectful:" text="Treat everyone with kindness and respect. Harassment, hate speech, and abusive language are strictly prohibited." colors={colors} />
                <BulletItem bold="Stay on Topic:" text="Keep your needs, offers, and replies relevant. Do not spam or use the platform for unsolicited advertising." colors={colors} />
                <BulletItem bold="Honesty and Transparency:" text="Be truthful about your needs and what you can offer. Do not misrepresent yourself or your intentions." colors={colors} />
                <BulletItem bold="Respect Privacy:" text="Do not share personal information of others without their explicit consent." colors={colors} />
            </View>

            {/* Section 2 */}
            <Text style={[styles.h2, { color: colors.text }]}>2. Personal Safety & Real-World Engagements</Text>
            <Text style={[styles.body, { color: colors.icon }]}>
                When an interaction begins on iNeedam and extends into the physical world, your safety is our top priority. Please observe these critical safety guidelines:
            </Text>
            <View style={[styles.bullets, { marginTop: 12 }]}>
                <BulletItem bold="Meet in Public:" text="Always arrange to meet in well-lit, public locations during daylight hours (e.g., coffee shops, malls, or local police station trading zones)." colors={colors} />
                <BulletItem bold="Bring a Friend:" text="Whenever possible, do not go alone to a meetup. Bring a friend or family member with you." colors={colors} />
                <BulletItem bold="Inform Others:" text="Tell someone you trust where you are going, who you are meeting, and approximately when you will return." colors={colors} />
                <BulletItem bold="Trust Your Instincts:" text="If a situation or person makes you feel uncomfortable, cancel the meeting or leave immediately. Your safety is more important than completing a transaction." colors={colors} />
                <BulletItem bold="Do Not Share Undue Personal Information:" text="Avoid giving out your home address, financial details, or other sensitive information unless absolutely necessary and you fully trust the other party." colors={colors} />
            </View>

            {/* Section 3 */}
            <Text style={[styles.h2, { color: colors.text }]}>3. Reporting Violations</Text>
            <Text style={[styles.body, { color: colors.icon }]}>
                If you experience or witness any behavior that violates these Rules of Engagement, either online or in person, please report it to us immediately using the in-app reporting tools or by contacting support. In case of immediate physical danger, always contact your local emergency services first.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48, gap: 10 },
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    h2: { fontSize: 18, fontWeight: '700', marginTop: 20 },
    intro: { fontSize: 15, lineHeight: 24 },
    body: { fontSize: 15, lineHeight: 24 },
    bullets: { gap: 12 },
    bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    bulletDot: { fontSize: 18, lineHeight: 24, fontWeight: '900' },
    bulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
});

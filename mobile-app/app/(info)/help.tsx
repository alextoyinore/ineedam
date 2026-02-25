import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HelpSection = ({ title, icon, children, theme }: any) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: Colors[theme].tabIconDefault + '15' }]}>
                <IconSymbol name={icon} size={20} color={Colors[theme].tint} />
            </View>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        </View>
        <View style={styles.sectionContent}>
            {children}
        </View>
    </View>
);

export default function HelpScreen() {
    const theme = useColorScheme() ?? 'light';

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedText style={styles.headerTitle}>App Help & Navigation</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Learn how to navigate and use Ineedam effectively.</ThemedText>

                <HelpSection title="Home Feed" icon="house.fill" theme={theme}>
                    <ThemedText style={styles.text}>
                        The <ThemedText style={styles.bold}>Home Feed</ThemedText> is where you see the latest needs and endorsements. Toggle between <ThemedText style={styles.italic}>"For You"</ThemedText> and <ThemedText style={styles.italic}>"Following"</ThemedText> to filter your view.
                    </ThemedText>
                </HelpSection>

                <HelpSection title="Finding Needs" icon="magnifyingglass" theme={theme}>
                    <ThemedText style={styles.text}>
                        Use the <ThemedText style={styles.bold}>Saved</ThemedText> tab or the search bar in the drawer to find specific needs by category, keyword, or location.
                    </ThemedText>
                </HelpSection>

                <HelpSection title="Saving for Later" icon="bookmark.fill" theme={theme}>
                    <ThemedText style={styles.text}>
                        Found a need you want to track? Tap the <ThemedText style={styles.bold}>Bookmark</ThemedText> icon. Access your saved items through the "Saved" tab.
                    </ThemedText>
                </HelpSection>

                <HelpSection title="Posting a Need" icon="plus.circle.fill" theme={theme}>
                    <ThemedText style={styles.text}>
                        Tap the <ThemedText style={styles.bold}>Plus (+)</ThemedText> button to create your own need. Be descriptive about your budget and location to get better proposals.
                    </ThemedText>
                </HelpSection>

                <HelpSection title="Endorsements" icon="star.fill" theme={theme}>
                    <ThemedText style={styles.text}>
                        When someone helps you, <ThemedText style={styles.bold}>Endorse</ThemedText> them! It builds their reputation. You can see endorsements on profiles and in the feed.
                    </ThemedText>
                </HelpSection>

                <HelpSection title="Your Profile" icon="person.fill" theme={theme}>
                    <ThemedText style={styles.text}>
                        The <ThemedText style={styles.bold}>Profile</ThemedText> tab shows your posts, history, and social stats. You can edit your settings and appearance from here.
                    </ThemedText>
                </HelpSection>

                <View style={[styles.footer, { backgroundColor: Colors[theme].tabIconDefault + '10' }]}>
                    <IconSymbol name="questionmark.circle.fill" size={32} color={Colors[theme].tint} />
                    <ThemedText style={styles.footerTitle}>Still have questions?</ThemedText>
                    <ThemedText style={styles.footerText}>
                        Check our FAQ or reach out to us through the feedback section in settings.
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
    headerSubtitle: { fontSize: 16, opacity: 0.6, marginBottom: 32 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    sectionContent: { paddingLeft: 0 },
    text: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
    bold: { fontWeight: '700' },
    italic: { fontStyle: 'italic' },
    footer: {
        marginTop: 20, padding: 24, borderRadius: 24,
        alignItems: 'center', textAlign: 'center'
    },
    footerTitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 4 },
    footerText: { fontSize: 14, opacity: 0.6, textAlign: 'center' }
});

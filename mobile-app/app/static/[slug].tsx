import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, H2, H3, Body, Muted, BodyBold } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { STATIC_PAGES } from '@/src/constants/StaticContent';
import { LinearGradient } from 'expo-linear-gradient';

export default function StaticScreen() {
    const { slug } = useLocalSearchParams();
    const router = useRouter();
    const page = STATIC_PAGES[slug as string];

    if (!page) {
        return (
            <View style={styles.container}>
                <H2>Page not found</H2>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={Colors.dark.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.hero}>
                        <H1 style={styles.title}>{page.title}</H1>
                        {page.subtitle && (
                            <H2 style={styles.subtitle}>{page.subtitle}</H2>
                        )}
                        {page.heroText && (
                            <Body style={styles.heroText}>{page.heroText}</Body>
                        )}
                    </View>

                    {page.sections.map((section: any, idx: number) => (
                        <View key={idx} style={styles.section}>
                            {section.title && <H2 style={styles.sectionTitle}>{section.title}</H2>}

                            {section.type === 'grid' && (
                                <View style={styles.grid}>
                                    {section.items.map((item: any, i: number) => (
                                        <GlassPanel key={i} style={styles.gridItem}>
                                            <item.icon size={32} color={Colors.dark.primary} style={styles.itemIcon} />
                                            <H3 style={styles.itemTitle}>{item.title}</H3>
                                            <Body style={styles.itemText}>{item.text}</Body>
                                        </GlassPanel>
                                    ))}
                                </View>
                            )}

                            {section.type === 'text' && (
                                <Body style={styles.textContent}>{section.content}</Body>
                            )}

                            {section.type === 'values' && (
                                <GlassPanel style={styles.valuesContainer}>
                                    {section.items.map((item: any, i: number) => (
                                        <View key={i} style={styles.valueRow}>
                                            <item.icon size={24} color={Colors.dark.primary} style={styles.valueIcon} />
                                            <View style={styles.valueContent}>
                                                <BodyBold>{item.title}</BodyBold>
                                                <Muted>{item.text}</Muted>
                                            </View>
                                        </View>
                                    ))}
                                </GlassPanel>
                            )}

                            {section.type === 'faq' && (
                                <View style={styles.faqList}>
                                    {section.items.map((item: any, i: number) => (
                                        <GlassPanel key={i} style={styles.faqItem}>
                                            <BodyBold style={styles.question}>{item.q}</BodyBold>
                                            <Body style={styles.answer}>{item.a}</Body>
                                        </GlassPanel>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        height: 60,
        justifyContent: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.bgSurfaceGlass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 60,
    },
    hero: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 20,
        color: Colors.dark.primary,
        marginBottom: Spacing.md,
    },
    heroText: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.dark.textMuted,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 22,
        marginBottom: Spacing.md,
    },
    grid: {
        gap: Spacing.md,
    },
    gridItem: {
        padding: Spacing.lg,
    },
    itemIcon: {
        marginBottom: Spacing.sm,
    },
    itemTitle: {
        fontSize: 18,
        marginBottom: 4,
    },
    itemText: {
        fontSize: 14,
        color: Colors.dark.textMuted,
        lineHeight: 20,
    },
    textContent: {
        fontSize: 15,
        lineHeight: 24,
    },
    valuesContainer: {
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    valueRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    valueIcon: {
        marginTop: 2,
    },
    valueContent: {
        flex: 1,
    },
    faqList: {
        gap: Spacing.md,
    },
    faqItem: {
        padding: Spacing.md,
    },
    question: {
        marginBottom: 4,
    },
    answer: {
        color: Colors.dark.textMuted,
        fontSize: 14,
    }
});

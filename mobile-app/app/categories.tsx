import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Platform
} from 'react-native';
import { ArrowLeft, Layers, ChevronRight } from 'lucide-react-native';
import { CATEGORIES } from '@/src/constants/Categories';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { useRouter } from 'expo-router';
import { GlassPanel } from '@/src/components/ui/GlassPanel';

export default function CategoriesScreen() {
    const router = useRouter();

    const renderCategory = ({ item: category }: { item: string }) => {
        if (category === 'All') return null;

        return (
            <TouchableOpacity
                onPress={() => router.push(`/(tabs)/explore?category=${encodeURIComponent(category)}`)}
                style={styles.categoryCard}
            >
                <GlassPanel intensity={20} style={styles.glass}>
                    <View style={styles.categoryInfo}>
                        <BodyBold style={styles.categoryName}>{category}</BodyBold>
                        <Muted>Explore needs in {category}</Muted>
                    </View>
                    <ChevronRight size={20} color={Colors.dark.textMuted} />
                </GlassPanel>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Layers size={20} color={Colors.dark.primary} />
                    <H2 style={styles.headerTitle}>Categories</H2>
                </View>
            </View>

            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={renderCategory}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Body style={styles.introText}>
                            Browse needs by category to find exactly what you're looking for.
                        </Body>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bgBase,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
        gap: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        marginVertical: 0,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    listHeader: {
        marginBottom: Spacing.xl,
    },
    introText: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        lineHeight: 22,
    },
    categoryCard: {
        marginBottom: Spacing.md,
    },
    glass: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 17,
        marginBottom: 2,
    }
});

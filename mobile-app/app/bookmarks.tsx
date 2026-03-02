import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, SafeAreaView
} from 'react-native';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H2, Muted } from '@/src/components/ui/Typography';
import { NeedCard } from '@/src/components/feed/NeedCard';
import { EndorsementCard } from '@/src/components/profile/EndorsementCard';
import { useAuth } from '@/src/context/AuthContext';
import { fetchBookmarkedItems } from '@/src/services/bookmarkService';

export default function BookmarksScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchBookmarkedItems(user.id)
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'need') return <NeedCard need={item} onPress={(id) => router.push(`/need/${id}` as any)} />;
        if (item.type === 'endorsement') return <EndorsementCard endorsement={item} />;
        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <View style={styles.titleRow}>
                    <Bookmark size={20} color={Colors.dark.primary} />
                    <H2 style={styles.title}>Bookmarks</H2>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, i) => `${item.type}-${item.id}-${i}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Bookmark size={48} color={Colors.dark.textMuted} strokeWidth={1} />
                            <Muted style={{ marginTop: 16 }}>No bookmarks yet</Muted>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.bgBase },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderColor: Colors.dark.borderGlass, gap: 16,
    },
    backBtn: { padding: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 18, marginVertical: 0 },
    listContent: { paddingBottom: 60 },
    empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
});

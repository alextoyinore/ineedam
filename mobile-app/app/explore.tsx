import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CATEGORIES } from '@/constants/categories';
import { searchNeeds } from '@/src/lib/needsService';
import { NeedCard } from '@/components/ui/need-card';
import { useAuth } from '@/src/context/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Search, Tag } from 'lucide-react-native';

export default function ExploreScreen() {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (query: string, category: string | null) => {
        if (!query && !category) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setLoading(true);
        try {
            const data = await searchNeeds({ query, category });
            setResults(data || []);
        } catch (error) {
            console.error('Error searching needs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch(searchQuery, selectedCategory);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory]);

    const renderCategoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.categoryCard,
                { backgroundColor: selectedCategory === item ? colors.tint : colors.tabIconDefault + '10' }
            ]}
            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
        >
            <Tag size={18} color={selectedCategory === item ? '#fff' : colors.icon} />
            <ThemedText style={[styles.categoryName, selectedCategory === item && { color: '#fff' }]}>
                {item}
            </ThemedText>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: colors.tabIconDefault + '15' }]}>
                    <Search size={20} color={colors.icon} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search needs, skills, or people..."
                        placeholderTextColor={colors.icon + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {!isSearching ? (
                <ScrollView contentContainerStyle={styles.exploreContent}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Trending Categories</ThemedText>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.slice(0, 12).map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.gridItem, { backgroundColor: colors.tabIconDefault + '10' }]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <ThemedText style={styles.gridText}>{cat}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.filterRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            {selectedCategory && (
                                <TouchableOpacity
                                    style={[styles.filterChip, { backgroundColor: colors.tint }]}
                                    onPress={() => setSelectedCategory(null)}
                                >
                                    <ThemedText style={{ color: '#fff', fontSize: 12 }}>{selectedCategory} ✕</ThemedText>
                                </TouchableOpacity>
                            )}
                            {CATEGORIES.filter(c => c !== selectedCategory).map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.filterChip, { backgroundColor: colors.tabIconDefault + '15' }]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <ThemedText style={{ fontSize: 12 }}>{cat}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={colors.tint} />
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            renderItem={({ item }) => (
                                <NeedCard
                                    need={{ ...item, type: 'need' }}
                                    currentUserId={user?.id}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={
                                <View style={styles.centered}>
                                    <ThemedText style={styles.mutedText}>No results found for your search.</ThemedText>
                                </View>
                            }
                        />
                    )}
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#35363620' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 24,
        height: 48,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    exploreContent: { padding: 16 },
    sectionTitle: { marginBottom: 16, fontSize: 20, fontWeight: '700' },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    gridItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridText: { fontSize: 14, fontWeight: '500' },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    categoryName: { fontSize: 16, fontWeight: '600' },
    filterRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#35363610' },
    filterScroll: { paddingHorizontal: 16, gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    mutedText: { opacity: 0.5, textAlign: 'center' },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Search, MapPin, Tag, TrendingUp, Filter } from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { NeedCard } from '@/src/components/feed/NeedCard';
import { searchNeeds, ShapedNeed } from '@/src/services/needsService';

import { CATEGORIES } from '@/src/constants/Categories';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [needs, setNeeds] = useState<ShapedNeed[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async (query: string, category: string) => {
    setIsLoading(true);
    try {
      const results = await searchNeeds({ query, category });
      setNeeds(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch(searchQuery, activeCategory);
  }, [activeCategory]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <H1 style={styles.title}>Explore</H1>
        <GlassPanel intensity={20} style={styles.searchContainer}>
          <Search size={20} color={Colors.dark.textMuted} />
          <TextInput
            placeholder="Search needs, services..."
            placeholderTextColor={Colors.dark.textMuted}
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => performSearch(searchQuery, activeCategory)}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => performSearch(searchQuery, activeCategory)}>
            <Filter size={18} color={Colors.dark.primary} />
          </TouchableOpacity>
        </GlassPanel>
      </View>

      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  ...styles.categoryCard,
                  ...(activeCategory === cat ? styles.categoryActive : {})
                } as any}
              >
                <BodyBold style={{
                  ...styles.categoryText,
                  ...(activeCategory === cat ? styles.categoryTextActive : {})
                } as any}>{cat}</BodyBold>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <FlatList
          data={needs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NeedCard need={item} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            isLoading ? (
              <ActivityIndicator color={Colors.dark.primary} style={{ marginTop: 20 }} />
            ) : (
              <H2 style={styles.resultsTitle}>{activeCategory === 'All' ? 'Latest Needs' : activeCategory}</H2>
            )
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Muted>No results found</Muted>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bgBase,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: 60,
  },
  title: {
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  filterBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.borderGlass,
    backgroundColor: Colors.dark.bgSurfaceGlass,
  },
  categoryActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  resultsTitle: {
    fontSize: 18,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  }
});

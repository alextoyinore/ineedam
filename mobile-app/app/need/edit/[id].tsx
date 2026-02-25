import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/AuthContext';
import { updateNeed, getNeedById } from '@/src/lib/needsService';
import { CATEGORIES } from '@/constants/categories';
import { MapPin, ChevronDown, Send, Trash2 } from 'lucide-react-native';

export default function EditNeedScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { user } = useAuth();

    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [location, setLocation] = useState('');
    const [currency, setCurrency] = useState('$');
    const [budgetMode, setBudgetMode] = useState('fixed');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');

    useEffect(() => {
        const loadNeed = async () => {
            if (!id) return;
            try {
                const need = await getNeedById(id as string);
                if (need) {
                    setTitle(need.title);
                    setDescription(need.description);
                    setCategory(need.category);
                    setLocation(need.location || '');
                    setCurrency(need.currency || '$');
                    setBudgetMode(need.budget_mode || 'fixed');
                    setBudgetMin(need.budget_min?.toString() || '');
                    setBudgetMax(need.budget_max?.toString() || '');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to load need details');
                router.back();
            } finally {
                setFetching(false);
            }
        };
        loadNeed();
    }, [id]);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        setLoading(true);
        try {
            await updateNeed(id as string, {
                title,
                description,
                category,
                location,
                currency,
                budget_mode: budgetMode,
                budget_min: budgetMin ? parseFloat(budgetMin) : null,
                budget_max: budgetMax ? parseFloat(budgetMax) : null,
            });
            Alert.alert('Success', 'Need updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update need');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.tint} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Title</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Description</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formSection, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Category</ThemedText>
                        <TouchableOpacity
                            style={[styles.input, styles.rowInput, { borderColor: colors.tabIconDefault + '30' }]}
                            onPress={() => {
                                const buttons: any[] = CATEGORIES.slice(0, 10).map(cat => ({
                                    text: cat,
                                    onPress: () => setCategory(cat)
                                }));
                                buttons.push({ text: 'Cancel', onPress: () => { }, style: 'cancel' });
                                Alert.alert('Select Category', '', buttons);
                            }}
                        >
                            <ThemedText>{category}</ThemedText>
                            <ChevronDown size={16} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formSection, { flex: 1, marginLeft: 12 }]}>
                        <ThemedText style={styles.label}>Location</ThemedText>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Budget & Timing</ThemedText>
                    <View style={styles.budgetContainer}>
                        <TextInput
                            style={[styles.input, styles.currencyInput, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                            value={currency}
                            onChangeText={setCurrency}
                            maxLength={3}
                        />
                        <TouchableOpacity
                            style={[styles.input, styles.modeInput, { borderColor: colors.tabIconDefault + '30' }]}
                            onPress={() => {
                                Alert.alert('Budget Mode', '', [
                                    { text: 'Fixed', onPress: () => setBudgetMode('fixed') },
                                    { text: 'Range', onPress: () => setBudgetMode('range') },
                                    { text: 'Hourly', onPress: () => setBudgetMode('hourly') },
                                    { text: 'Cancel', style: 'cancel' }
                                ]);
                            }}
                        >
                            <ThemedText style={{ fontSize: 12 }}>{budgetMode.toUpperCase()}</ThemedText>
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                            keyboardType="numeric"
                            value={budgetMin}
                            onChangeText={setBudgetMin}
                        />
                        {budgetMode === 'range' && (
                            <>
                                <ThemedText style={{ marginHorizontal: 4 }}>-</ThemedText>
                                <TextInput
                                    style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                                    keyboardType="numeric"
                                    value={budgetMax}
                                    onChangeText={setBudgetMax}
                                />
                            </>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.tint }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Send size={18} color="#fff" />
                            <ThemedText style={styles.submitText}>Save Changes</ThemedText>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16 },
    formSection: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, opacity: 0.7 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    rowInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    budgetContainer: { flexDirection: 'row', alignItems: 'center' },
    currencyInput: { width: 50, textAlign: 'center', marginRight: 8 },
    modeInput: { width: 80, alignItems: 'center', justifyContent: 'center', marginRight: 8, paddingHorizontal: 4 },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

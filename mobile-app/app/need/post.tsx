import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/AuthContext';
import { createNeed } from '@/src/lib/needsService';
import { CATEGORIES } from '@/constants/categories';
import { Banknote, MapPin, Clock, X, ChevronDown, Send } from 'lucide-react-native';

export default function PostNeedScreen() {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [location, setLocation] = useState('');
    const [flexibility, setFlexibility] = useState('Flexible start');
    const [currency, setCurrency] = useState('$');
    const [budgetMode, setBudgetMode] = useState('fixed');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        setLoading(true);
        try {
            await createNeed({
                title,
                description,
                category,
                location,
                flexibility,
                currency,
                budget_mode: budgetMode,
                budget_min: budgetMin ? parseFloat(budgetMin) : null,
                budget_max: budgetMax ? parseFloat(budgetMax) : null,
                user_id: user?.id,
                status: 'open'
            });
            Alert.alert('Success', 'Need posted successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to post need');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Title</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                        placeholder="What do you need?"
                        placeholderTextColor={colors.icon + '80'}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formSection}>
                    <ThemedText style={styles.label}>Description</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                        placeholder="Describe your need in detail..."
                        placeholderTextColor={colors.icon + '80'}
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
                                // Simple list alerting for now, could be a real picker
                                Alert.alert('Select Category', '', CATEGORIES.slice(0, 10).map(cat => ({
                                    text: cat,
                                    onPress: () => setCategory(cat)
                                })).concat([{ text: 'Cancel', style: 'cancel' }]));
                            }}
                        >
                            <ThemedText>{category}</ThemedText>
                            <ChevronDown size={16} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formSection, { flex: 1, marginLeft: 12 }]}>
                        <ThemedText style={styles.label}>Location</ThemedText>
                        <View style={styles.inputWithIcon}>
                            <MapPin size={16} color={colors.icon} style={styles.icon} />
                            <TextInput
                                style={[styles.input, { flex: 1, paddingLeft: 32, color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                                placeholder="Remote/City"
                                placeholderTextColor={colors.icon + '80'}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>
                </View>

                <View style={[styles.formSection]}>
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
                            placeholder={budgetMode === 'range' ? 'Min' : 'Amount'}
                            placeholderTextColor={colors.icon + '80'}
                            keyboardType="numeric"
                            value={budgetMin}
                            onChangeText={setBudgetMin}
                        />
                        {budgetMode === 'range' && (
                            <>
                                <ThemedText style={{ marginHorizontal: 4 }}>-</ThemedText>
                                <TextInput
                                    style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.tabIconDefault + '30' }]}
                                    placeholder="Max"
                                    placeholderTextColor={colors.icon + '80'}
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
                            <ThemedText style={styles.submitText}>Post Need</ThemedText>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    inputWithIcon: { position: 'relative', justifyContent: 'center' },
    icon: { position: 'absolute', left: 10, zIndex: 1 },
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

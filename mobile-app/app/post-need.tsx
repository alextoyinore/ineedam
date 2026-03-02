import React, { useState } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { ArrowLeft, Send, DollarSign, MapPin, Clock, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, H3, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '@/src/constants/Categories';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';

const FLEXIBILITY_OPTIONS = [
    { label: 'Need it ASAP (Urgent)', value: 'ASAP' },
    { label: 'Within a Week', value: 'within_week' },
    { label: 'Flexible / Whenever', value: 'Flexible start' },
    { label: 'Must be exact date', value: 'Specific date' },
];

const BUDGET_MODES = [
    { label: 'Fixed Price', value: 'fixed' },
    { label: 'Range', value: 'range' },
    { label: 'Hourly Rate', value: 'hourly' },
];

export default function PostNeedScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[1]);
    const [location, setLocation] = useState('');
    const [budgetMode, setBudgetMode] = useState('fixed');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [flexibility, setFlexibility] = useState('Flexible start');
    const [submitting, setSubmitting] = useState(false);

    const [showCategories, setShowCategories] = useState(false);
    const [showBudgetModes, setShowBudgetModes] = useState(false);
    const [showFlexibility, setShowFlexibility] = useState(false);

    const canSubmit = title.trim() && description.trim() && budgetMin;

    const handleSubmit = async () => {
        if (!canSubmit || !user) return;
        setSubmitting(true);

        try {
            const { error } = await supabase.from('needs').insert([{
                user_id: user.id,
                title: title.trim(),
                description: description.trim(),
                category,
                location: location.trim() || 'Remote',
                budget_mode: budgetMode,
                budget_min: parseFloat(budgetMin) || 0,
                budget_max: budgetMode === 'range' ? (parseFloat(budgetMax) || null) : null,
                currency: '$',
                flexibility,
                status: 'open',
            }]);

            if (error) throw error;

            Alert.alert('Posted!', 'Your need has been posted. Providers will reach out to you.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to post need. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={22} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <H3 style={styles.headerTitle}>Post a Need</H3>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <H1 style={styles.mainTitle}>What do you need?</H1>
                    <Muted style={styles.subtitle}>Be specific so providers can offer you the best match.</Muted>

                    {/* Title */}
                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Title *</BodyBold>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Need a Python Tutor for Data Science"
                            placeholderTextColor={Colors.dark.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Category Picker */}
                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Category *</BodyBold>
                        <TouchableOpacity style={styles.select} onPress={() => setShowCategories(!showCategories)}>
                            <Body style={styles.selectText}>{category}</Body>
                            <ChevronDown size={18} color={Colors.dark.textMuted} />
                        </TouchableOpacity>
                        {showCategories && (
                            <GlassPanel intensity={20} style={styles.dropdown}>
                                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.dropdownItem, category === cat && styles.dropdownItemActive]}
                                        onPress={() => { setCategory(cat); setShowCategories(false); }}
                                    >
                                        <Body style={category === cat ? styles.dropdownTextActive : {}}>{cat}</Body>
                                    </TouchableOpacity>
                                ))}
                            </GlassPanel>
                        )}
                    </View>

                    {/* Location */}
                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Location / Delivery</BodyBold>
                        <View style={styles.inputRow}>
                            <MapPin size={18} color={Colors.dark.textMuted} style={{ marginRight: 8 }} />
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                                placeholder="Remote, City, or Address"
                                placeholderTextColor={Colors.dark.textMuted}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Description *</BodyBold>
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            placeholder="Describe what you are looking for. Include requirements, quality expectations, deadlines…"
                            placeholderTextColor={Colors.dark.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Budget */}
                    <H3 style={styles.sectionTitle}>Budget & Constraints</H3>

                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Budget Type</BodyBold>
                        <TouchableOpacity style={styles.select} onPress={() => setShowBudgetModes(!showBudgetModes)}>
                            <Body style={styles.selectText}>{BUDGET_MODES.find(m => m.value === budgetMode)?.label}</Body>
                            <ChevronDown size={18} color={Colors.dark.textMuted} />
                        </TouchableOpacity>
                        {showBudgetModes && (
                            <GlassPanel intensity={20} style={styles.dropdown}>
                                {BUDGET_MODES.map(m => (
                                    <TouchableOpacity
                                        key={m.value}
                                        style={[styles.dropdownItem, budgetMode === m.value && styles.dropdownItemActive]}
                                        onPress={() => { setBudgetMode(m.value); setShowBudgetModes(false); }}
                                    >
                                        <Body style={budgetMode === m.value ? styles.dropdownTextActive : {}}>{m.label}</Body>
                                    </TouchableOpacity>
                                ))}
                            </GlassPanel>
                        )}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.field, { flex: 1 }]}>
                            <BodyBold style={styles.label}>{budgetMode === 'range' ? 'Min $' : 'Amount $'} *</BodyBold>
                            <View style={styles.inputRow}>
                                <DollarSign size={16} color={Colors.dark.textMuted} style={{ marginRight: 6 }} />
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                                    placeholder="0"
                                    placeholderTextColor={Colors.dark.textMuted}
                                    value={budgetMin}
                                    onChangeText={setBudgetMin}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                        {budgetMode === 'range' && (
                            <View style={[styles.field, { flex: 1, marginLeft: Spacing.md }]}>
                                <BodyBold style={styles.label}>Max $</BodyBold>
                                <View style={styles.inputRow}>
                                    <DollarSign size={16} color={Colors.dark.textMuted} style={{ marginRight: 6 }} />
                                    <TextInput
                                        style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                                        placeholder="0"
                                        placeholderTextColor={Colors.dark.textMuted}
                                        value={budgetMax}
                                        onChangeText={setBudgetMax}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Flexibility */}
                    <View style={styles.field}>
                        <BodyBold style={styles.label}>Time Flexibility</BodyBold>
                        <TouchableOpacity style={styles.select} onPress={() => setShowFlexibility(!showFlexibility)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <Clock size={16} color={Colors.dark.textMuted} />
                                <Body style={styles.selectText}>{FLEXIBILITY_OPTIONS.find(f => f.value === flexibility)?.label}</Body>
                            </View>
                            <ChevronDown size={18} color={Colors.dark.textMuted} />
                        </TouchableOpacity>
                        {showFlexibility && (
                            <GlassPanel intensity={20} style={styles.dropdown}>
                                {FLEXIBILITY_OPTIONS.map(f => (
                                    <TouchableOpacity
                                        key={f.value}
                                        style={[styles.dropdownItem, flexibility === f.value && styles.dropdownItemActive]}
                                        onPress={() => { setFlexibility(f.value); setShowFlexibility(false); }}
                                    >
                                        <Body style={flexibility === f.value ? styles.dropdownTextActive : {}}>{f.label}</Body>
                                    </TouchableOpacity>
                                ))}
                            </GlassPanel>
                        )}
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { opacity: canSubmit ? 1 : 0.4 }]}
                        onPress={handleSubmit}
                        disabled={!canSubmit || submitting}
                    >
                        <LinearGradient
                            colors={Colors.gradients.primary as [string, string, ...string[]]}
                            style={styles.submitGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {submitting
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <Send size={20} color="#fff" />
                                    <BodyBold style={styles.submitText}>Post "I Need Am"</BodyBold>
                                </>
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.bgBase },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderColor: Colors.dark.borderGlass, gap: 12,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    scrollContent: { padding: Spacing.lg },
    mainTitle: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
    subtitle: { marginBottom: Spacing.xl },
    field: { marginBottom: Spacing.lg },
    label: { fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, borderWidth: 1, borderColor: Colors.dark.borderGlass,
        color: Colors.dark.textPrimary, fontSize: 15, padding: 14,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, borderWidth: 1, borderColor: Colors.dark.borderGlass,
        paddingHorizontal: 14, paddingVertical: 12,
    },
    textarea: { minHeight: 120, textAlignVertical: 'top' },
    select: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, borderWidth: 1, borderColor: Colors.dark.borderGlass,
        paddingHorizontal: 14, paddingVertical: 14,
    },
    selectText: { color: Colors.dark.textPrimary, flex: 1 },
    dropdown: { marginTop: 4, borderRadius: 12, overflow: 'hidden', zIndex: 10 },
    dropdownItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.dark.borderGlass },
    dropdownItemActive: { backgroundColor: 'rgba(99,102,241,0.1)' },
    dropdownTextActive: { color: Colors.dark.primary, fontWeight: '700' },
    row: { flexDirection: 'row' },
    divider: { height: 1, backgroundColor: Colors.dark.borderGlass, marginVertical: Spacing.xl },
    sectionTitle: { fontSize: 18, marginBottom: Spacing.lg },
    submitBtn: { marginTop: Spacing.xl, borderRadius: 28, overflow: 'hidden', height: 58 },
    submitGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    submitText: { color: '#fff', fontSize: 18 },
});

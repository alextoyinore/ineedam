import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, Volume2, VolumeX, Bell, Shield,
    Moon, Sun, Monitor, Trash2, LogOut, Star, UserX,
    ChevronRight
} from 'lucide-react-native';
import { Colors, Spacing } from '@/src/theme/Theme';
import { H1, H2, Body, BodyBold, Muted } from '@/src/components/ui/Typography';
import { GlassPanel } from '@/src/components/ui/GlassPanel';
import { useSettings } from '@/src/context/SettingsContext';
import { supabase } from '@/src/lib/supabase';

export default function SettingsScreen() {
    const router = useRouter();
    const { settings, toggleSetting, updateSetting } = useSettings();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            router.replace('/(tabs)');
        }
    };

    const sections = [
        {
            title: 'General',
            items: [
                {
                    id: 'soundsEnabled',
                    label: 'Sound Effects',
                    description: 'Play sounds for messages',
                    type: 'toggle',
                    icon: settings.soundsEnabled ? Volume2 : VolumeX,
                    value: settings.soundsEnabled
                },
                {
                    id: 'theme',
                    label: 'Appearance',
                    description: 'Customize layout colors',
                    type: 'select',
                    icon: settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : Monitor,
                    value: settings.theme
                }
            ]
        },
        {
            title: 'Notifications',
            items: [
                {
                    id: 'pushNotifications',
                    label: 'Push Notifications',
                    description: 'Get alerts on your device',
                    type: 'toggle',
                    icon: Bell,
                    value: settings.pushNotifications
                }
            ]
        },
        {
            title: 'Account & Security',
            items: [
                {
                    id: 'privateProfile',
                    label: 'Private Profile',
                    description: 'Only followers see posts',
                    type: 'toggle',
                    icon: Shield,
                    value: settings.privateProfile
                },
                {
                    id: 'blockedAccounts',
                    label: 'Blocked Accounts',
                    description: 'Manage users you blocked',
                    type: 'link',
                    icon: UserX
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={Colors.dark.textPrimary} />
                </TouchableOpacity>
                <H2>Settings</H2>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {sections.map(section => (
                    <View key={section.title} style={styles.section}>
                        <Muted style={styles.sectionTitle}>{section.title}</Muted>
                        <GlassPanel intensity={10} style={styles.sectionCard}>
                            {section.items.map((item, idx) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.item,
                                        idx !== section.items.length - 1 && styles.itemBorder
                                    ]}
                                >
                                    <View style={styles.iconContainer}>
                                        <item.icon size={20} color={Colors.dark.primary} />
                                    </View>
                                    <View style={styles.itemContent}>
                                        <BodyBold>{item.label}</BodyBold>
                                        <Muted style={styles.itemDesc}>{item.description}</Muted>
                                    </View>

                                    {item.type === 'toggle' ? (
                                        <Switch
                                            value={item.id === 'soundsEnabled' ? settings.soundsEnabled :
                                                item.id === 'pushNotifications' ? settings.pushNotifications :
                                                    settings.privateProfile}
                                            onValueChange={() => toggleSetting(item.id as any)}
                                            trackColor={{ false: '#333', true: Colors.dark.primary }}
                                            thumbColor="#fff"
                                        />
                                    ) : (
                                        <ChevronRight size={18} color={Colors.dark.textMuted} />
                                    )}
                                </View>
                            ))}
                        </GlassPanel>
                    </View>
                ))}

                {/* Premium Teaser */}
                <View style={styles.section}>
                    <Muted style={styles.sectionTitle}>Upgrade</Muted>
                    <TouchableOpacity activeOpacity={0.8}>
                        <GlassPanel intensity={20} style={styles.premiumCard}>
                            <View style={[styles.iconContainer, styles.premiumIcon]}>
                                <Star size={20} color="#fff" fill="#fff" />
                            </View>
                            <View style={styles.itemContent}>
                                <View style={styles.premiumHeader}>
                                    <BodyBold>iNeedAm Premium</BodyBold>
                                    <View style={styles.badge}><Muted style={styles.badgeText}>NEW</Muted></View>
                                </View>
                                <Muted style={styles.itemDesc}>Unlock exclusive features</Muted>
                            </View>
                            <ChevronRight size={18} color={Colors.dark.textMuted} />
                        </GlassPanel>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <Muted style={styles.sectionTitle}>Session</Muted>
                    <GlassPanel intensity={10} style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.item}
                            onPress={handleLogout}
                        >
                            <View style={[styles.iconContainer, styles.logoutIcon]}>
                                <LogOut size={20} color="#ef4444" />
                            </View>
                            <View style={styles.itemContent}>
                                <BodyBold style={{ color: '#ef4444' }}>Log Out</BodyBold>
                                <Muted style={styles.itemDesc}>Sign out of your account</Muted>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.itemBorder} />

                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => Alert.alert('Delete Account', 'Are you sure? This is permanent.')}
                        >
                            <View style={[styles.iconContainer, styles.logoutIcon, { opacity: 0.5 }]}>
                                <Trash2 size={20} color="#ef4444" />
                            </View>
                            <View style={styles.itemContent}>
                                <BodyBold style={{ color: '#ef4444' }}>Delete Account</BodyBold>
                                <Muted style={styles.itemDesc}>Permanently remove your data</Muted>
                            </View>
                        </TouchableOpacity>
                    </GlassPanel>
                </View>

                <Muted style={styles.version}>iNeedAm v1.0.4 · Mobile</Muted>
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.dark.bgSurfaceGlass,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        paddingLeft: 4,
    },
    sectionCard: {
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
    },
    itemDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    premiumCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    premiumIcon: {
        backgroundColor: Colors.dark.primary,
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 8,
        color: '#ec4899',
        fontWeight: '800',
    },
    logoutIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    version: {
        textAlign: 'center',
        marginTop: Spacing.xl,
        fontSize: 12,
    }
});

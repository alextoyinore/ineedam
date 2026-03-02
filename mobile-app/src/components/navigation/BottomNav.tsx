import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Search, Mail, User, Bell } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../theme/Theme';
import { GlassPanel } from '../ui/GlassPanel';
import { Muted } from '../ui/Typography';
import { useRouter, usePathname } from 'expo-router';
import { MobileDrawer } from './MobileDrawer';

export const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const navItems = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Explore', icon: Search, path: '/explore' },
        { label: 'Bell', icon: Bell, path: '/notifications' },
        { label: 'Messages', icon: Mail, path: '/messages' },
        { label: 'Profile', icon: User, path: '/profile', isProfile: true },
    ];

    return (
        <View style={styles.container}>
            <GlassPanel intensity={40} borderRadius={0} style={styles.glass}>
                <View style={styles.navRow}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <TouchableOpacity
                                key={item.label}
                                onPress={() => {
                                    if (item.isProfile) {
                                        setIsDrawerOpen(true);
                                    } else {
                                        router.push(item.path as any);
                                    }
                                }}
                                style={styles.navItem}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon
                                        size={24}
                                        color={isActive ? Colors.dark.primary : Colors.dark.textMuted}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {isActive && <View style={styles.activeDot} />}
                                </View>
                                <Muted style={{
                                    ...styles.label,
                                    ...(isActive ? { color: Colors.dark.primary, fontWeight: '700' } : {})
                                } as any}>
                                    {item.label}
                                </Muted>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </GlassPanel>
            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 88 : 70,
    },
    glass: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    navRow: {
        flexDirection: 'row',
        height: '100%',
        paddingBottom: Platform.OS === 'ios' ? 25 : 0,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        flex: 1,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    label: {
        fontSize: 10,
        marginTop: 2,
    },
    activeDot: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.dark.primary,
    }
});

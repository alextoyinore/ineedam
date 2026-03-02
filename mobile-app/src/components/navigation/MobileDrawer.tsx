import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TextInput,
    ScrollView,
    Image,
    Platform,
    Modal
} from 'react-native';
import { X, Settings, HelpCircle, Shield, Users, TrendingUp, Award, Search, Bookmark, ChevronRight, LogOut, FileText, BookOpen } from 'lucide-react-native';
import { Colors, Spacing } from '../../theme/Theme';
import { H2, Body, BodyBold, Muted } from '../ui/Typography';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
    const { profile, signOut } = useAuth();
    const router = useRouter();
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isOpen ? 0 : width,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNavigation = (path: string) => {
        router.push(path as any);
        onClose();
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
    };

    return (
        <Modal
            transparent
            visible={isOpen}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={styles.backdrop}
                >
                    <BlurView intensity={20} tint="dark" style={styles.blur} />
                </TouchableOpacity>

                {/* Drawer Content */}
                <Animated.View style={[
                    styles.drawer,
                    { transform: [{ translateX: slideAnim }] }
                ]}>
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <Image
                                source={require('@/assets/images/icon.png')}
                                style={styles.logo}
                            />
                            <BodyBold style={styles.logoText}>Ineedam</BodyBold>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={Colors.dark.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Profile Section */}
                        {profile && (
                            <TouchableOpacity
                                style={styles.profileSection}
                                onPress={() => handleNavigation(`/profile`)}
                            >
                                <View style={styles.avatarContainer}>
                                    {profile.avatar_url ? (
                                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                                    ) : (
                                        <LinearGradient
                                            colors={Colors.gradients.primary as [string, string, ...string[]]}
                                            style={styles.avatarPlaceholder}
                                        >
                                            <BodyBold style={styles.avatarInitial}>
                                                {profile.display_name?.charAt(0).toUpperCase()}
                                            </BodyBold>
                                        </LinearGradient>
                                    )}
                                </View>
                                <View style={styles.profileInfo}>
                                    <BodyBold style={styles.displayName}>{profile.display_name}</BodyBold>
                                    <Muted>@{profile.username}</Muted>
                                </View>
                                <ChevronRight size={20} color={Colors.dark.textMuted} />
                            </TouchableOpacity>
                        )}

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchWrapper}>
                                <Search size={18} color={Colors.dark.textMuted} style={styles.searchIcon} />
                                <TextInput
                                    placeholder="Search Ineedam..."
                                    placeholderTextColor={Colors.dark.textMuted}
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={() => {
                                        if (searchQuery.trim()) {
                                            handleNavigation(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                                        }
                                    }}
                                />
                            </View>
                        </View>

                        {/* Navigation Links */}
                        <View style={styles.navLinks}>
                            <TouchableOpacity style={styles.navLink} onPress={() => handleNavigation('/who-to-follow')}>
                                <Users size={22} color={Colors.dark.primary} />
                                <Body style={styles.navLinkText}>Who to follow</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={() => handleNavigation('/bookmarks')}>
                                <Bookmark size={22} color={Colors.dark.accent} />
                                <Body style={styles.navLinkText}>Bookmarks</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={() => handleNavigation('/categories')}>
                                <TrendingUp size={22} color={Colors.dark.secondary} />
                                <Body style={styles.navLinkText}>Explore Categories</Body>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Utility Links */}
                        <View style={styles.utilityLinks}>
                            <TouchableOpacity style={styles.utilityLink} onPress={() => handleNavigation('/settings')}>
                                <Settings size={20} color={Colors.dark.textMuted} />
                                <Body style={styles.utilityLinkText}>Settings</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityLink} onPress={() => handleNavigation('/help')}>
                                <HelpCircle size={20} color={Colors.dark.textMuted} />
                                <Body style={styles.utilityLinkText}>Help Center</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityLink} onPress={() => handleNavigation('/terms')}>
                                <FileText size={20} color={Colors.dark.textMuted} />
                                <Body style={styles.utilityLinkText}>Terms of Service</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityLink} onPress={() => handleNavigation('/privacy')}>
                                <Shield size={20} color={Colors.dark.textMuted} />
                                <Body style={styles.utilityLinkText}>Privacy Policy</Body>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.utilityLink} onPress={() => handleNavigation('/rules')}>
                                <BookOpen size={20} color={Colors.dark.textMuted} />
                                <Body style={styles.utilityLinkText}>Rules of Engagement</Body>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Out */}
                        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                            <LogOut size={20} color="#ef4444" />
                            <Body style={styles.signOutText}>Sign Out</Body>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    drawer: {
        width: width * 0.8,
        height: '100%',
        backgroundColor: Colors.dark.bgBase,
        borderLeftWidth: 1,
        borderColor: Colors.dark.borderGlass,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.dark.borderGlass,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 32,
        height: 32,
    },
    logoText: {
        fontSize: 18,
        color: Colors.dark.primary,
    },
    closeBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingVertical: Spacing.lg,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 18,
    },
    profileInfo: {
        flex: 1,
    },
    displayName: {
        fontSize: 16,
    },
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.bgSurfaceGlass,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.dark.borderGlass,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: Colors.dark.textPrimary,
        fontSize: 14,
    },
    navLinks: {
        paddingVertical: Spacing.sm,
    },
    navLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: 16,
    },
    navLinkText: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.dark.borderGlass,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.md,
    },
    utilityLinks: {
        paddingVertical: Spacing.sm,
    },
    utilityLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        gap: 16,
    },
    utilityLinkText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 24,
        gap: 16,
        marginTop: Spacing.lg,
    },
    signOutText: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '600',
    }
});

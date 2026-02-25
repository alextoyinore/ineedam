import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { useColorScheme, TouchableOpacity, Alert, Platform, ActionSheetIOS, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const router = useRouter();

  const handleHelpPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Help', 'App Info'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) router.push('/(info)/help' as any);
          else if (buttonIndex === 2) showAppInfo();
        }
      );
    } else {
      Alert.alert(
        'Help & Info',
        'Find guidance or information about the app.',
        [
          { text: 'Help', onPress: () => router.push('/(info)/help' as any) },
          { text: 'App Info', onPress: () => showAppInfo() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const showAppInfo = () => {
    Alert.alert(
      'Ineedam',
      'Version 1.0.0 (Alpha)\n\nConnecting real needs with real solutions. Built for clarity, speed, and community trust.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === 'dark' ? Colors.dark.tint : Colors.light.tint,
        headerShown: true,
        headerTitle: () => <BrandLogo width={120} />,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleHelpPress}
            style={{ marginRight: 16, padding: 4 }}
          >
            <IconSymbol
              name="questionmark.circle"
              size={24}
              color={theme === 'dark' ? Colors.dark.tint : Colors.light.tint}
            />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: theme === 'dark' ? Colors.dark.background : Colors.light.background,
          borderBottomWidth: 1,
          borderBottomColor: (theme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault) + '20',
        },
        headerShadowVisible: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mail.outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

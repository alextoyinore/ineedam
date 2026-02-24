import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: true,
        headerTitle: () => <BrandLogo width={120} />,
        headerStyle: {
          backgroundColor: Colors[theme].background,
          borderBottomWidth: 1,
          borderBottomColor: Colors[theme].tabIconDefault + '20',
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

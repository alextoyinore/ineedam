import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasSeenOnboarding && !session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, hasSeenOnboarding]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(info)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="need/post" options={{ presentation: 'modal', title: 'Post Need' }} />
        <Stack.Screen name="need/edit/[id]" options={{ presentation: 'modal', title: 'Edit Need' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { NotificationsProvider } from '@/src/context/NotificationsContext';
import { MessagesProvider } from '@/src/context/MessagesContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <RootLayoutNav />
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

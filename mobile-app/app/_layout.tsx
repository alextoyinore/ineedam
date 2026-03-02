import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { AppLayout } from '@/src/components/layout/AppLayout';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { MessagesProvider } from '@/src/context/MessagesContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { MessageSecurityProvider } from '@/src/context/MessageSecurityContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MessageSecurityProvider>
          <MessagesProvider>
            <AppLayout>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings/index" />
                <Stack.Screen name="chat/[id]" />
                <Stack.Screen name="who-to-follow" />
                <Stack.Screen name="categories" />
                <Stack.Screen name="bookmarks" />
                <Stack.Screen name="post-need" />
                <Stack.Screen name="need/[id]" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </AppLayout>
          </MessagesProvider>
        </MessageSecurityProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

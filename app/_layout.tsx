import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNotificationSetup } from '../src/hooks/useNotifications';

export default function RootLayout() {
  useNotificationSetup();
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

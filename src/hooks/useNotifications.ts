// expo-notifications push functionality was removed from Expo Go since SDK 53.
// These are stubs for Expo Go compatibility.
// Use `npx expo run:android` (development build) to enable real notifications.

export function useNotificationSetup() {
  // no-op in Expo Go
}

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleRecoveryNotification(): Promise<void> {
  // no-op in Expo Go
}

export async function cancelAllNotifications(): Promise<void> {
  // no-op in Expo Go
}

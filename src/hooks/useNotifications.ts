import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { MuscleTimer, UserProfile, MUSCLE_DEFAULTS } from '../types';
import { getRemainingHours, isRecovered } from '../utils/recovery';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRecoveryNotification(timer: MuscleTimer, profile: UserProfile) {
  const remaining = getRemainingHours(timer, profile);
  if (remaining <= 0) return;

  const triggerSeconds = remaining * 3600;
  const def = MUSCLE_DEFAULTS[timer.group];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `💪 ${def.label} 회복 완료!`,
      body: `${def.label} 근육이 완전히 회복되었습니다. 오늘 운동 준비가 되었어요!`,
      data: { muscleGroup: timer.group },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: triggerSeconds },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function useNotificationSetup() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    requestNotificationPermission();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from './Colors';

interface RecoveryBarProps {
  label: string;
  progress: number;
  remainingHours: number;
  color: string;
}

export function RecoveryBar({ label, progress, remainingHours, color }: RecoveryBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const widthPercent = Math.round(clamped * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.hours, remainingHours === 0 && { color: Colors.success }]}>
          {remainingHours === 0 ? 'Ready' : `${remainingHours}h left`}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${widthPercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  hours: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from './Colors';

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  target?: string;
  color?: string;
  iconName?: string;
}

export function StatCard({ label, value, unit, target, color = Colors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.unit}> {unit}</Text>
      </View>
      {target ? <Text style={styles.target}>Goal: {target}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  target: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from './Colors';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit: string;
  target?: string;
  color?: string;
}

export function StatCard({ icon, label, value, unit, target, color = Colors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: `${color}22` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {target ? (
          <Text style={styles.target}>
            <Text style={styles.unit}> {unit}</Text>/{target}
          </Text>
        ) : (
          <Text style={styles.unit}> {unit}</Text>
        )}
      </View>
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
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  target: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});

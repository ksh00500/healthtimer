import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from './Colors';

interface CircleTimerProps {
  label: string;
  displayHours: number;
  progress: number;
  color: string;
  isRecovered: boolean;
  onPress?: () => void;
}

const SIZE = 140;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircleTimer({ label, displayHours, progress, color, isRecovered, onPress }: CircleTimerProps) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const bgColor = isRecovered ? `${color}22` : Colors.surface;

  return (
    <TouchableOpacity style={[styles.wrapper, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.8}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.border}
          strokeWidth={STROKE}
          fill="transparent"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={styles.hours}>
          {isRecovered ? '✓' : displayHours}
          {!isRecovered && <Text style={styles.hUnit}>h</Text>}
        </Text>
        <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
  },
  hours: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  hUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
});

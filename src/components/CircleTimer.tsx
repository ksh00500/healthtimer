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

const SIZE = 130;
const STROKE = 7;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircleTimer({
  label,
  displayHours,
  progress,
  color,
  isRecovered,
  onPress,
}: CircleTimerProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - clamped);

  return (
    <TouchableOpacity
      style={[styles.wrapper, isRecovered && { backgroundColor: `${color}18` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Svg
        width={SIZE}
        height={SIZE}
        style={styles.svg}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
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
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.content}>
        {isRecovered ? (
          <Text style={[styles.checkmark, { color }]}>✓</Text>
        ) : (
          <View style={styles.hoursRow}>
            <Text style={styles.hours}>{displayHours}</Text>
            <Text style={styles.hUnit}>h</Text>
          </View>
        )}
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
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hours: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  hUnit: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 1,
  },
  checkmark: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});

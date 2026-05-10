import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { CircleTimer } from '../../src/components/CircleTimer';
import { Card } from '../../src/components/Card';
import {
  getRecoveryProgress,
  getRemainingHours,
  getRecoveryHours,
  isRecovered,
} from '../../src/utils/recovery';
import { MUSCLE_DEFAULTS, MuscleGroup } from '../../src/types';

const ORDERED_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

export default function TimersScreen() {
  const { muscleTimers, profile, setMuscleWorked, adjustTimerHours, resetTimer } = useAppStore();
  const [selected, setSelected] = useState<MuscleGroup | null>(null);

  const selectedTimer = muscleTimers.find((t) => t.group === selected);

  function handlePress(group: MuscleGroup) {
    setSelected(group);
  }

  function handleMarkWorked() {
    if (!selected) return;
    const timer = muscleTimers.find((t) => t.group === selected);
    if (timer && !isRecovered(timer, profile)) {
      Alert.alert(
        'Overtraining Warning',
        `${MUSCLE_DEFAULTS[selected].label} hasn't fully recovered yet (${getRemainingHours(timer, profile)}h remaining). Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            style: 'destructive',
            onPress: () => {
              setMuscleWorked(selected);
              setSelected(null);
            },
          },
        ]
      );
    } else {
      setMuscleWorked(selected);
      setSelected(null);
    }
  }

  function handleReset() {
    if (!selected) return;
    resetTimer(selected);
    setSelected(null);
  }

  function handleClose() {
    setSelected(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Timers</Text>
        <Text style={styles.subtitle}>Check muscle recovery status and log workouts</Text>

        <View style={styles.grid}>
          {ORDERED_GROUPS.map((group) => {
            const timer = muscleTimers.find((t) => t.group === group)!;
            const progress = getRecoveryProgress(timer, profile);
            const remaining = getRemainingHours(timer, profile);
            const recovered = isRecovered(timer, profile);
            const def = MUSCLE_DEFAULTS[group];

            return (
              <View key={group} style={styles.cell}>
                <CircleTimer
                  label={def.label}
                  displayHours={recovered ? 0 : remaining}
                  progress={progress}
                  color={def.color}
                  isRecovered={recovered}
                  onPress={() => handlePress(group)}
                />
              </View>
            );
          })}
        </View>

        <Card style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Fully Recovered</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>Recovering</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }]} />
              <Text style={styles.legendText}>Not Tracked</Text>
            </View>
          </View>
          <Text style={styles.legendNote}>
            Recovery time adjusts based on your body weight, age, and fitness level
          </Text>
        </Card>
      </ScrollView>

      {/* Timer Detail Modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={styles.modalSheet}>
            {selected !== null && selectedTimer ? (
              <>
                <View style={styles.modalHandle} />
                {(() => {
                  const def = MUSCLE_DEFAULTS[selected];
                  const remaining = getRemainingHours(selectedTimer, profile);
                  const total = getRecoveryHours(selectedTimer, profile);
                  const recovered = isRecovered(selectedTimer, profile);
                  const workedAt = selectedTimer.lastWorkedAt
                    ? new Date(selectedTimer.lastWorkedAt).toLocaleString()
                    : null;

                  return (
                    <>
                      <View style={[styles.modalColorDot, { backgroundColor: def.color }]} />
                      <Text style={styles.modalTitle}>{def.label}</Text>
                      <Text style={[styles.modalStatus, recovered && { color: Colors.success }]}>
                        {recovered ? 'Fully Recovered' : `${remaining}h remaining / ${total}h total`}
                      </Text>
                      {workedAt ? (
                        <Text style={styles.modalLastWorked}>Last workout: {workedAt}</Text>
                      ) : null}

                      <Text style={styles.modalSectionLabel}>Adjust Recovery Hours</Text>
                      <View style={styles.adjustRow}>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => adjustTimerHours(selected, -4)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adjustBtnText}>−4h</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => adjustTimerHours(selected, -1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adjustBtnText}>−1h</Text>
                        </TouchableOpacity>
                        <Text style={styles.adjustCurrent}>
                          {selectedTimer.customHours ?? selectedTimer.baseHours}h
                        </Text>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => adjustTimerHours(selected, 1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adjustBtnText}>+1h</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => adjustTimerHours(selected, 4)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adjustBtnText}>+4h</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[styles.workedBtn, { backgroundColor: def.color }]}
                        onPress={handleMarkWorked}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.workedBtnText}>Mark as Worked</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={handleReset}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.resetBtnText}>Reset Timer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={handleClose}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.closeBtnText}>Close</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  cell: { alignItems: 'center' },

  legend: { marginTop: 8 },
  legendTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  legendItems: { flexDirection: 'row', gap: 16, marginBottom: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textSecondary, fontSize: 12 },
  legendNote: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  modalColorDot: { width: 48, height: 48, borderRadius: 24, marginBottom: 12 },
  modalTitle: { color: Colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  modalStatus: { color: Colors.textSecondary, fontSize: 16, marginBottom: 4 },
  modalLastWorked: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
  modalSectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  adjustBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adjustBtnText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  adjustCurrent: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  workedBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  workedBtnText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  resetBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: { color: Colors.textSecondary, fontSize: 15 },
  closeBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeBtnText: { color: Colors.textMuted, fontSize: 15 },
});

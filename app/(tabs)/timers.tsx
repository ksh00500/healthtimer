import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { CircleTimer } from '../../src/components/CircleTimer';
import { Card } from '../../src/components/Card';
import { getRecoveryProgress, getRemainingHours, getRecoveryHours, isRecovered } from '../../src/utils/recovery';
import { MUSCLE_DEFAULTS, MuscleGroup } from '../../src/types';

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
        '⚠ 과훈련 경고',
        `${MUSCLE_DEFAULTS[selected].label} 근육이 아직 완전히 회복되지 않았습니다 (${getRemainingHours(timer, profile)}h 남음). 계속 진행하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '진행', style: 'destructive', onPress: () => { setMuscleWorked(selected); setSelected(null); } },
        ]
      );
    } else {
      setMuscleWorked(selected);
      setSelected(null);
    }
  }

  const orderedGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Timers</Text>
        <Text style={styles.subtitle}>근육 회복 현황을 확인하고 운동을 기록하세요</Text>

        <View style={styles.grid}>
          {orderedGroups.map((group) => {
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
          <Text style={styles.legendTitle}>범례</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.legendText}>완전 회복</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>회복 중</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.surface }]} />
              <Text style={styles.legendText}>기록 없음</Text>
            </View>
          </View>
          <Text style={styles.legendNote}>* 신체 정보(체중, 나이, 레벨)에 따라 회복 시간이 자동 조정됩니다</Text>
        </Card>
      </ScrollView>

      {/* Timer Detail Modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selected && selectedTimer && (() => {
              const def = MUSCLE_DEFAULTS[selected];
              const remaining = getRemainingHours(selectedTimer, profile);
              const total = getRecoveryHours(selectedTimer, profile);
              const recovered = isRecovered(selectedTimer, profile);
              const workedAt = selectedTimer.lastWorkedAt
                ? new Date(selectedTimer.lastWorkedAt).toLocaleString('ko-KR')
                : null;

              return (
                <>
                  <View style={styles.modalHandle} />
                  <View style={[styles.modalDot, { backgroundColor: def.color }]} />
                  <Text style={styles.modalTitle}>{def.label}</Text>
                  <Text style={styles.modalStatus}>
                    {recovered ? '✓ 완전 회복 완료' : `${remaining}h 남음 / 총 ${total}h`}
                  </Text>
                  {workedAt && (
                    <Text style={styles.modalLastWorked}>마지막 운동: {workedAt}</Text>
                  )}

                  {/* Adjust hours */}
                  <Text style={styles.modalSectionLabel}>회복 시간 조정</Text>
                  <View style={styles.adjustRow}>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => adjustTimerHours(selected, -4)}
                    >
                      <Text style={styles.adjustBtnText}>−4h</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => adjustTimerHours(selected, -1)}
                    >
                      <Text style={styles.adjustBtnText}>−1h</Text>
                    </TouchableOpacity>
                    <Text style={styles.adjustCurrent}>{selectedTimer.customHours ?? selectedTimer.baseHours}h</Text>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => adjustTimerHours(selected, 1)}
                    >
                      <Text style={styles.adjustBtnText}>+1h</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => adjustTimerHours(selected, 4)}
                    >
                      <Text style={styles.adjustBtnText}>+4h</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.workedBtn, { backgroundColor: def.color }]}
                    onPress={handleMarkWorked}
                  >
                    <Text style={styles.workedBtnText}>운동 완료로 표시</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.resetBtn} onPress={() => { resetTimer(selected); setSelected(null); }}>
                    <Text style={styles.resetBtnText}>타이머 초기화</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                    <Text style={styles.closeBtnText}>닫기</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 24 },
  cell: { alignItems: 'center' },

  legend: { marginTop: 8 },
  legendTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  legendItems: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.border },
  legendText: { color: Colors.textSecondary, fontSize: 12 },
  legendNote: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 20 },
  modalDot: { width: 48, height: 48, borderRadius: 24, marginBottom: 12 },
  modalTitle: { color: Colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  modalStatus: { color: Colors.textSecondary, fontSize: 16, marginBottom: 4 },
  modalLastWorked: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
  modalSectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, alignSelf: 'flex-start' },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  adjustBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  adjustBtnText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  adjustCurrent: { color: Colors.text, fontSize: 20, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  workedBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  workedBtnText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  resetBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  resetBtnText: { color: Colors.textSecondary, fontSize: 15 },
  closeBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeBtnText: { color: Colors.textMuted, fontSize: 15 },
});

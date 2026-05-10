import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { Card } from '../../src/components/Card';
import { Goal } from '../../src/types';

export default function ProfileScreen() {
  const { profile, updateProfile, workoutLogs, foodLogs, sleepLogs, addGoal, deleteGoal, updateGoal } = useAppStore();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [showApiKey, setShowApiKey] = useState(false);

  function handleSave() {
    updateProfile(form);
    setEditMode(false);
    Alert.alert('✓ 프로필 저장 완료');
  }

  function handleAddGoal() {
    Alert.alert('목표 추가', '어떤 목표를 설정하시겠습니까?', [
      {
        text: '주간 운동 횟수',
        onPress: () => {
          const goal: Goal = {
            id: Date.now().toString(),
            type: 'workout_frequency',
            title: '주 3회 운동',
            target: 3,
            unit: '회',
            current: workoutLogs.filter((w) => {
              const d = new Date(w.date);
              const now = new Date();
              const weekAgo = new Date(now);
              weekAgo.setDate(now.getDate() - 7);
              return d >= weekAgo;
            }).length,
            period: 'weekly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
          addGoal(goal);
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  }

  function exportData() {
    const data = {
      profile,
      workoutLogs: workoutLogs.slice(0, 50),
      foodLogs: foodLogs.slice(0, 50),
      sleepLogs: sleepLogs.slice(0, 50),
      exportDate: new Date().toISOString(),
    };
    Alert.alert('데이터 내보내기', `총 ${workoutLogs.length}개 운동 기록, ${foodLogs.length}개 식단 기록이 준비되었습니다.\n\n실제 구현 시 CSV/PDF 파일로 저장됩니다.`);
  }

  const totalWorkouts = workoutLogs.length;
  const thisWeekWorkouts = workoutLogs.filter((w) => {
    const d = new Date(w.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={editMode ? handleSave : () => setEditMode(true)}
            style={[styles.editBtn, editMode && styles.editBtnSave]}
          >
            <Text style={[styles.editBtnText, editMode && styles.editBtnTextSave]}>
              {editMode ? '저장' : '편집'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>총 운동</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{thisWeekWorkouts}</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{foodLogs.length}</Text>
            <Text style={styles.statLabel}>식단 기록</Text>
          </Card>
        </View>

        {/* Body Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>신체 정보</Text>
          <View style={styles.fieldGrid}>
            <ProfileField
              label="이름" value={form.name}
              editable={editMode} onEdit={(v) => setForm({ ...form, name: v })}
              placeholder="이름 입력"
            />
            <ProfileField
              label="나이" value={String(form.age)}
              editable={editMode} onEdit={(v) => setForm({ ...form, age: Number(v) || 25 })}
              keyboardType="number-pad"
            />
            <ProfileField
              label="키 (cm)" value={String(form.height)}
              editable={editMode} onEdit={(v) => setForm({ ...form, height: Number(v) || 175 })}
              keyboardType="decimal-pad"
            />
            <ProfileField
              label="체중 (kg)" value={String(form.weight)}
              editable={editMode} onEdit={(v) => setForm({ ...form, weight: Number(v) || 70 })}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.fieldLabel}>성별</Text>
          <View style={styles.chipRow}>
            {(['male', 'female', 'other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                disabled={!editMode}
                style={[styles.chip, form.gender === g && styles.chipActive]}
                onPress={() => setForm({ ...form, gender: g })}
              >
                <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                  {g === 'male' ? '남성' : g === 'female' ? '여성' : '기타'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>피트니스 레벨</Text>
          <View style={styles.chipRow}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                disabled={!editMode}
                style={[styles.chip, form.fitnessLevel === lvl && styles.chipActive]}
                onPress={() => setForm({ ...form, fitnessLevel: lvl })}
              >
                <Text style={[styles.chipText, form.fitnessLevel === lvl && styles.chipTextActive]}>
                  {lvl === 'beginner' ? '초급' : lvl === 'intermediate' ? '중급' : '고급'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Goals */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>목표</Text>
            <TouchableOpacity onPress={handleAddGoal} style={styles.addGoalBtn}>
              <Text style={styles.addGoalBtnText}>+ 추가</Text>
            </TouchableOpacity>
          </View>

          {profile.goals.length === 0 && (
            <Text style={styles.emptyText}>아직 설정된 목표가 없습니다</Text>
          )}

          {profile.goals.map((goal) => {
            const progress = Math.min(goal.current / goal.target, 1);
            return (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalProgressText}>
                    {goal.current} / {goal.target} {goal.unit}
                  </Text>
                  <Text style={styles.goalProgressPct}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.goalTrack}>
                  <View style={[styles.goalFill, { width: `${progress * 100}%`, backgroundColor: Colors.primary }]} />
                </View>
              </View>
            );
          })}
        </Card>

        {/* API Key */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI 설정</Text>
          <Text style={styles.apiKeyNote}>Claude AI 분석을 사용하려면 Anthropic API Key가 필요합니다</Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={[styles.apiKeyInput, { flex: 1 }]}
              value={form.anthropicApiKey}
              onChangeText={(v) => setForm({ ...form, anthropicApiKey: v })}
              placeholder="sk-ant-..."
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeBtn}>
              <Text style={styles.eyeBtnText}>{showApiKey ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {editMode && (
            <TouchableOpacity style={styles.saveApiBtn} onPress={handleSave}>
              <Text style={styles.saveApiBtnText}>API Key 저장</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Data Export */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={exportData}>
            <Text style={styles.exportIcon}>📊</Text>
            <View>
              <Text style={styles.exportTitle}>데이터 내보내기</Text>
              <Text style={styles.exportSubtitle}>운동, 식단, 수면 기록 CSV 추출</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Text style={styles.footer}>HealthTimer v1.0 · Powered by Claude AI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileField({
  label, value, editable, onEdit, placeholder, keyboardType
}: {
  label: string;
  value: string;
  editable: boolean;
  onEdit: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'number-pad' | 'decimal-pad' | 'default';
}) {
  return (
    <View style={profileFieldStyles.wrapper}>
      <Text style={profileFieldStyles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={profileFieldStyles.input}
          value={value}
          onChangeText={onEdit}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
        />
      ) : (
        <Text style={profileFieldStyles.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const profileFieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  input: {
    color: Colors.text, fontSize: 16, backgroundColor: Colors.surfaceElevated,
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: Colors.border,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  editBtnSave: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  editBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  editBtnTextSave: { color: Colors.background },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },

  sectionCard: { marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addGoalBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.primary },
  addGoalBtnText: { color: Colors.background, fontSize: 13, fontWeight: '700' },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 8 },

  fieldGrid: { marginBottom: 8 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceElevated },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 14 },
  chipTextActive: { color: Colors.background, fontWeight: '700' },

  goalItem: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  deleteBtn: { color: Colors.textMuted, fontSize: 14 },
  goalProgress: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalProgressText: { color: Colors.textSecondary, fontSize: 13 },
  goalProgressPct: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  goalTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 3 },

  apiKeyNote: { color: Colors.textSecondary, fontSize: 13, marginBottom: 12 },
  apiKeyRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  apiKeyInput: {
    color: Colors.text, fontSize: 14, backgroundColor: Colors.surfaceElevated,
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  eyeBtn: { padding: 12, backgroundColor: Colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  eyeBtnText: { fontSize: 18 },
  saveApiBtn: { marginTop: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  saveApiBtnText: { color: Colors.background, fontWeight: '700' },

  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  exportIcon: { fontSize: 28 },
  exportTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  exportSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});

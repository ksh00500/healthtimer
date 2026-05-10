import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { Card } from '../../src/components/Card';
import { MUSCLE_DEFAULTS, MuscleGroup, WorkoutLog, FoodLog, SleepLog } from '../../src/types';
import { todayStr } from '../../src/utils/date';
import { checkOvertrain, formatOvertainWarning } from '../../src/hooks/useOvertrain';

type Tab = 'workout' | 'food' | 'sleep';

export default function AddScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const { addWorkoutLog, addFoodLog, addSleepLog, setMuscleWorked } = useAppStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Tab Selector */}
      <View style={styles.tabBar}>
        {(['workout', 'food', 'sleep'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'workout' ? '🏋️ 운동' : tab === 'food' ? '🍎 식단' : '🌙 수면'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'workout' && (
        <WorkoutForm onSave={(log) => { addWorkoutLog(log); log.muscleGroups.forEach((g) => setMuscleWorked(g)); }} />
      )}
      {activeTab === 'food' && (
        <FoodForm onSave={addFoodLog} />
      )}
      {activeTab === 'sleep' && (
        <SleepForm onSave={addSleepLog} />
      )}
    </SafeAreaView>
  );
}

// ── Workout Form ────────────────────────────────────────────────────────────
function WorkoutForm({ onSave }: { onSave: (log: WorkoutLog) => void }) {
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);
  const [duration, setDuration] = useState('60');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [exercises, setExercises] = useState<{ name: string; reps: string; weight: string }[]>([
    { name: '', reps: '10', weight: '60' },
  ]);
  const [notes, setNotes] = useState('');
  const { muscleTimers, profile } = useAppStore();

  function toggleGroup(group: MuscleGroup) {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  function handleSave() {
    if (selectedGroups.length === 0) {
      Alert.alert('근육 부위를 선택해주세요');
      return;
    }

    const warnings = checkOvertrain(selectedGroups, muscleTimers, profile);
    if (warnings.length > 0) {
      Alert.alert(
        '⚠ 과훈련 경고',
        formatOvertainWarning(warnings),
        [
          { text: '취소', style: 'cancel' },
          { text: '계속 진행', style: 'destructive', onPress: () => doSave() },
        ]
      );
      return;
    }
    doSave();
  }

  function doSave() {
    const totalVolume = exercises.reduce((s, e) => {
      return s + (Number(e.reps) || 0) * (Number(e.weight) || 0);
    }, 0);

    const log: WorkoutLog = {
      id: Date.now().toString(),
      date: todayStr(),
      muscleGroups: selectedGroups,
      durationMinutes: Number(duration) || 60,
      exercises: exercises.filter((e) => e.name).map((e, i) => ({
        id: `${Date.now()}-${i}`,
        name: e.name,
        muscleGroup: selectedGroups[0],
        sets: [{ reps: Number(e.reps) || 0, weight: Number(e.weight) || 0 }],
      })),
      totalVolume,
      notes,
      intensity,
    };
    onSave(log);
    Alert.alert('✓ 운동 기록 완료', '회복 타이머가 시작되었습니다.');
    setSelectedGroups([]);
    setExercises([{ name: '', reps: '10', weight: '60' }]);
    setNotes('');
  }

  const orderedGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  return (
    <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>근육 부위</Text>
      <View style={styles.muscleGrid}>
        {orderedGroups.map((group) => {
          const def = MUSCLE_DEFAULTS[group];
          const selected = selectedGroups.includes(group);
          return (
            <TouchableOpacity
              key={group}
              style={[styles.muscleChip, selected && { backgroundColor: def.color, borderColor: def.color }]}
              onPress={() => toggleGroup(group)}
            >
              <Text style={[styles.muscleChipText, selected && { color: Colors.background }]}>
                {def.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>운동 시간 (분)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionLabel}>운동 강도</Text>
      <View style={styles.intensityRow}>
        {(['light', 'moderate', 'heavy'] as const).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.intensityBtn, intensity === lvl && styles.intensityActive]}
            onPress={() => setIntensity(lvl)}
          >
            <Text style={[styles.intensityText, intensity === lvl && styles.intensityTextActive]}>
              {lvl === 'light' ? '가벼움' : lvl === 'moderate' ? '보통' : '강함'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>운동 목록</Text>
      {exercises.map((ex, i) => (
        <Card key={i} style={styles.exerciseCard}>
          <TextInput
            style={styles.exerciseNameInput}
            value={ex.name}
            onChangeText={(v) => {
              const next = [...exercises];
              next[i].name = v;
              setExercises(next);
            }}
            placeholder="운동 이름 (예: 벤치프레스)"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.exerciseRow}>
            <View style={styles.exerciseField}>
              <Text style={styles.exerciseFieldLabel}>횟수</Text>
              <TextInput
                style={styles.exerciseFieldInput}
                value={ex.reps}
                onChangeText={(v) => {
                  const next = [...exercises];
                  next[i].reps = v;
                  setExercises(next);
                }}
                keyboardType="number-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.exerciseField}>
              <Text style={styles.exerciseFieldLabel}>무게 (kg)</Text>
              <TextInput
                style={styles.exerciseFieldInput}
                value={ex.weight}
                onChangeText={(v) => {
                  const next = [...exercises];
                  next[i].weight = v;
                  setExercises(next);
                }}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </Card>
      ))}
      <TouchableOpacity
        style={styles.addExerciseBtn}
        onPress={() => setExercises([...exercises, { name: '', reps: '10', weight: '60' }])}
      >
        <Text style={styles.addExerciseBtnText}>+ 운동 추가</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>메모</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="오늘 운동 메모..."
        placeholderTextColor={Colors.textMuted}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>운동 기록 저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Food Form ────────────────────────────────────────────────────────────────
function FoodForm({ onSave }: { onSave: (log: FoodLog) => void }) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  function handleSave() {
    if (!foodName || !calories) {
      Alert.alert('음식 이름과 칼로리를 입력해주세요');
      return;
    }
    const cal = Number(calories) || 0;
    const pro = Number(protein) || 0;
    const carb = Number(carbs) || 0;
    const f = Number(fat) || 0;

    const log: FoodLog = {
      id: Date.now().toString(),
      date: todayStr(),
      mealType,
      foods: [{
        id: Date.now().toString(),
        name: foodName,
        calories: cal,
        protein: pro,
        carbs: carb,
        fat: f,
        amount: 1,
        unit: '인분',
        isFavorite: false,
      }],
      totalCalories: cal,
      totalProtein: pro,
      totalCarbs: carb,
      totalFat: f,
    };
    onSave(log);
    Alert.alert('✓ 식단 기록 완료');
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  return (
    <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>식사 종류</Text>
      <View style={styles.mealRow}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.mealBtn, mealType === m && styles.mealBtnActive]}
            onPress={() => setMealType(m)}
          >
            <Text style={[styles.mealBtnText, mealType === m && styles.mealBtnTextActive]}>
              {m === 'breakfast' ? '아침' : m === 'lunch' ? '점심' : m === 'dinner' ? '저녁' : '간식'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>음식 이름</Text>
      <TextInput
        style={styles.input}
        value={foodName}
        onChangeText={setFoodName}
        placeholder="예: 닭가슴살 샐러드"
        placeholderTextColor={Colors.textMuted}
      />

      <View style={styles.nutritionGrid}>
        {[
          { label: '칼로리 (kcal)', value: calories, set: setCalories },
          { label: '단백질 (g)', value: protein, set: setProtein },
          { label: '탄수화물 (g)', value: carbs, set: setCarbs },
          { label: '지방 (g)', value: fat, set: setFat },
        ].map(({ label, value, set }) => (
          <View key={label} style={styles.nutritionField}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={set}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
              placeholder="0"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>식단 기록 저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Sleep Form ───────────────────────────────────────────────────────────────
function SleepForm({ onSave }: { onSave: (log: SleepLog) => void }) {
  const [totalHours, setTotalHours] = useState('7');
  const [deepHours, setDeepHours] = useState('1.5');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');

  function handleSave() {
    const log: SleepLog = {
      id: Date.now().toString(),
      date: todayStr(),
      bedtime: '23:00',
      wakeTime: '07:00',
      totalHours: Number(totalHours) || 7,
      deepSleepHours: Number(deepHours) || 1.5,
      quality,
    };
    onSave(log);
    Alert.alert('✓ 수면 기록 완료');
    setTotalHours('7');
    setDeepHours('1.5');
    setQuality('good');
  }

  return (
    <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>총 수면 시간 (시간)</Text>
      <TextInput
        style={styles.input}
        value={totalHours}
        onChangeText={setTotalHours}
        keyboardType="decimal-pad"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionLabel}>깊은 수면 시간 (시간)</Text>
      <TextInput
        style={styles.input}
        value={deepHours}
        onChangeText={setDeepHours}
        keyboardType="decimal-pad"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionLabel}>수면의 질</Text>
      <View style={styles.qualityRow}>
        {(['poor', 'fair', 'good', 'excellent'] as const).map((q) => (
          <TouchableOpacity
            key={q}
            style={[styles.qualityBtn, quality === q && styles.qualityBtnActive]}
            onPress={() => setQuality(q)}
          >
            <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
              {q === 'poor' ? '😴 나쁨' : q === 'fair' ? '😐 보통' : q === 'good' ? '😊 좋음' : '🌟 최상'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>수면 기록 저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.background },

  form: { flex: 1 },
  formContent: { padding: 20, paddingBottom: 60 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },

  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muscleChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  muscleChipText: { color: Colors.text, fontSize: 14 },

  input: {
    backgroundColor: Colors.surface, color: Colors.text, borderRadius: 12,
    padding: 14, fontSize: 16, borderWidth: 1, borderColor: Colors.border,
  },
  notesInput: { height: 80, textAlignVertical: 'top' },

  intensityRow: { flexDirection: 'row', gap: 8 },
  intensityBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  intensityActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  intensityText: { color: Colors.textSecondary, fontSize: 14 },
  intensityTextActive: { color: Colors.background, fontWeight: '700' },

  exerciseCard: { marginBottom: 8, padding: 12 },
  exerciseNameInput: {
    color: Colors.text, fontSize: 15, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 10,
  },
  exerciseRow: { flexDirection: 'row', gap: 12 },
  exerciseField: { flex: 1 },
  exerciseFieldLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  exerciseFieldInput: {
    color: Colors.text, fontSize: 16, fontWeight: '600',
    backgroundColor: Colors.surfaceElevated, padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
  },

  addExerciseBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginTop: 4 },
  addExerciseBtnText: { color: Colors.textSecondary, fontSize: 14 },

  mealRow: { flexDirection: 'row', gap: 8 },
  mealBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  mealBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  mealBtnText: { color: Colors.textSecondary, fontSize: 13 },
  mealBtnTextActive: { color: Colors.background, fontWeight: '700' },

  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  nutritionField: { width: '50%', paddingRight: 8 },

  qualityRow: { gap: 8 },
  qualityBtn: {
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  qualityBtnActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  qualityText: { color: Colors.textSecondary, fontSize: 15 },
  qualityTextActive: { color: Colors.text, fontWeight: '700' },

  saveBtn: {
    marginTop: 24, backgroundColor: Colors.primary,
    paddingVertical: 18, borderRadius: 16, alignItems: 'center',
  },
  saveBtnText: { color: Colors.background, fontSize: 17, fontWeight: '700' },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { Card } from '../../src/components/Card';
import { MUSCLE_DEFAULTS, MuscleGroup, WorkoutLog, FoodLog, SleepLog } from '../../src/types';
import { todayStr } from '../../src/utils/date';
import { checkOvertrain, formatOvertainWarning } from '../../src/hooks/useOvertrain';

type Tab = 'workout' | 'food' | 'sleep';

const TAB_LABELS: Record<Tab, string> = {
  workout: '운동',
  food: '식단',
  sleep: '수면',
};

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
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'workout' && (
        <WorkoutForm
          onSave={(log) => {
            addWorkoutLog(log);
            log.muscleGroups.forEach((g) => setMuscleWorked(g));
          }}
        />
      )}
      {activeTab === 'food' && <FoodForm onSave={addFoodLog} />}
      {activeTab === 'sleep' && <SleepForm onSave={addSleepLog} />}
    </SafeAreaView>
  );
}

// ── Workout Form ──────────────────────────────────────────────────────────────
function WorkoutForm({ onSave }: { onSave: (log: WorkoutLog) => void }) {
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);
  const [duration, setDuration] = useState('60');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [exercises, setExercises] = useState([{ name: '', reps: '10', weight: '60' }]);
  const [notes, setNotes] = useState('');
  const { muscleTimers, profile } = useAppStore();

  const orderedGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  function toggleGroup(group: MuscleGroup) {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  }

  function updateExercise(index: number, field: 'name' | 'reps' | 'weight', value: string) {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: '', reps: '10', weight: '60' }]);
  }

  function handleSave() {
    if (selectedGroups.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one muscle group.');
      return;
    }

    const warnings = checkOvertrain(selectedGroups, muscleTimers, profile);
    if (warnings.length > 0) {
      Alert.alert('Overtraining Warning', formatOvertainWarning(warnings), [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: doSave },
      ]);
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
      exercises: exercises
        .filter((e) => e.name.trim())
        .map((e, i) => ({
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
    Alert.alert('Saved', 'Workout logged. Recovery timers have started.');
    setSelectedGroups([]);
    setExercises([{ name: '', reps: '10', weight: '60' }]);
    setNotes('');
    setDuration('60');
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Muscle Groups</Text>
        <View style={styles.muscleGrid}>
          {orderedGroups.map((group) => {
            const def = MUSCLE_DEFAULTS[group];
            const isSelected = selectedGroups.includes(group);
            return (
              <TouchableOpacity
                key={group}
                style={[
                  styles.muscleChip,
                  isSelected && { backgroundColor: def.color, borderColor: def.color },
                ]}
                onPress={() => toggleGroup(group)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.muscleChipText, isSelected && { color: Colors.background }]}
                >
                  {def.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          placeholderTextColor={Colors.textMuted}
          placeholder="60"
        />

        <Text style={styles.sectionLabel}>Intensity</Text>
        <View style={styles.rowBtns}>
          {(['light', 'moderate', 'heavy'] as const).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.rowBtn, intensity === lvl && styles.rowBtnActive]}
              onPress={() => setIntensity(lvl)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowBtnText, intensity === lvl && styles.rowBtnTextActive]}>
                {lvl === 'light' ? 'Light' : lvl === 'moderate' ? 'Moderate' : 'Heavy'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Exercises</Text>
        {exercises.map((ex, i) => (
          <Card key={i} style={styles.exerciseCard}>
            <TextInput
              style={styles.exerciseNameInput}
              value={ex.name}
              onChangeText={(v) => updateExercise(i, 'name', v)}
              placeholder="Exercise name (e.g. Bench Press)"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseField}>
                <Text style={styles.exerciseFieldLabel}>Reps</Text>
                <TextInput
                  style={styles.exerciseFieldInput}
                  value={ex.reps}
                  onChangeText={(v) => updateExercise(i, 'reps', v)}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.exerciseField}>
                <Text style={styles.exerciseFieldLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.exerciseFieldInput}
                  value={ex.weight}
                  onChangeText={(v) => updateExercise(i, 'weight', v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </Card>
        ))}
        <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise} activeOpacity={0.7}>
          <Text style={styles.addExerciseBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Workout notes..."
          placeholderTextColor={Colors.textMuted}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.saveBtnWrapper}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Food Form ─────────────────────────────────────────────────────────────────
function FoodForm({ onSave }: { onSave: (log: FoodLog) => void }) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const MEAL_LABELS: Record<typeof mealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  function handleSave() {
    if (!foodName.trim() || !calories) {
      Alert.alert('Missing Info', 'Please enter food name and calories.');
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
      foods: [
        {
          id: Date.now().toString(),
          name: foodName,
          calories: cal,
          protein: pro,
          carbs: carb,
          fat: f,
          amount: 1,
          unit: 'serving',
          isFavorite: false,
        },
      ],
      totalCalories: cal,
      totalProtein: pro,
      totalCarbs: carb,
      totalFat: f,
    };
    onSave(log);
    Alert.alert('Saved', 'Food log saved.');
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Meal Type</Text>
        <View style={styles.mealRow}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.mealBtn, mealType === m && styles.mealBtnActive]}
              onPress={() => setMealType(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.mealBtnText, mealType === m && styles.mealBtnTextActive]}>
                {MEAL_LABELS[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Food Name</Text>
        <TextInput
          style={styles.input}
          value={foodName}
          onChangeText={setFoodName}
          placeholder="e.g. Chicken Salad"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.sectionLabel}>Nutrition</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionField}>
            <Text style={styles.nutritionFieldLabel}>Calories (kcal)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
              placeholder="0"
            />
          </View>
          <View style={styles.nutritionField}>
            <Text style={styles.nutritionFieldLabel}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
              placeholder="0"
            />
          </View>
          <View style={styles.nutritionField}>
            <Text style={styles.nutritionFieldLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
              placeholder="0"
            />
          </View>
          <View style={styles.nutritionField}>
            <Text style={styles.nutritionFieldLabel}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              value={fat}
              onChangeText={setFat}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textMuted}
              placeholder="0"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.saveBtnWrapper}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>Save Food Log</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Sleep Form ────────────────────────────────────────────────────────────────
function SleepForm({ onSave }: { onSave: (log: SleepLog) => void }) {
  const [totalHours, setTotalHours] = useState('7');
  const [deepHours, setDeepHours] = useState('1.5');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');

  const QUALITY_LABELS: Record<typeof quality, string> = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

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
    Alert.alert('Saved', 'Sleep log saved.');
    setTotalHours('7');
    setDeepHours('1.5');
    setQuality('good');
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Total Sleep (hours)</Text>
        <TextInput
          style={styles.input}
          value={totalHours}
          onChangeText={setTotalHours}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textMuted}
          placeholder="7"
        />

        <Text style={styles.sectionLabel}>Deep Sleep (hours)</Text>
        <TextInput
          style={styles.input}
          value={deepHours}
          onChangeText={setDeepHours}
          keyboardType="decimal-pad"
          placeholderTextColor={Colors.textMuted}
          placeholder="1.5"
        />

        <Text style={styles.sectionLabel}>Sleep Quality</Text>
        <View style={styles.qualityGrid}>
          {(['poor', 'fair', 'good', 'excellent'] as const).map((q) => (
            <TouchableOpacity
              key={q}
              style={[styles.qualityBtn, quality === q && styles.qualityBtnActive]}
              onPress={() => setQuality(q)}
              activeOpacity={0.7}
            >
              <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
                {QUALITY_LABELS[q]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.saveBtnWrapper}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>Save Sleep Log</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.background, fontWeight: '700' },

  form: { flex: 1 },
  formContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },

  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },

  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muscleChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  muscleChipText: { color: Colors.text, fontSize: 14, fontWeight: '500' },

  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: { height: 80 },

  rowBtns: { flexDirection: 'row', gap: 8 },
  rowBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rowBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  rowBtnTextActive: { color: Colors.background, fontWeight: '700' },

  exerciseCard: { marginBottom: 8, padding: 12 },
  exerciseNameInput: {
    color: Colors.text,
    fontSize: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 10,
  },
  exerciseRow: { flexDirection: 'row', gap: 12 },
  exerciseField: { flex: 1 },
  exerciseFieldLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseFieldInput: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  addExerciseBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addExerciseBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },

  mealRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  mealBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  mealBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  mealBtnTextActive: { color: Colors.background, fontWeight: '700' },

  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutritionField: { width: '47%' },
  nutritionFieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },

  qualityGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  qualityBtn: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qualityBtnActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  qualityText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  qualityTextActive: { color: Colors.text, fontWeight: '700' },

  saveBtnWrapper: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.background, fontSize: 17, fontWeight: '700' },
});

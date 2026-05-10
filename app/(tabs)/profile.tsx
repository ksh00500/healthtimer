import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { Card } from '../../src/components/Card';
import { Goal } from '../../src/types';

export default function ProfileScreen() {
  const { profile, updateProfile, workoutLogs, foodLogs, addGoal, deleteGoal } = useAppStore();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [showApiKey, setShowApiKey] = useState(false);

  function handleSave() {
    updateProfile(form);
    setEditMode(false);
    Alert.alert('Saved', 'Profile saved successfully.');
  }

  function handleEditToggle() {
    if (editMode) {
      handleSave();
    } else {
      setForm({ ...profile });
      setEditMode(true);
    }
  }

  function handleAddGoal() {
    Alert.alert('Add Goal', 'What type of goal would you like to set?', [
      {
        text: 'Weekly Workout Frequency',
        onPress: () => {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const goal: Goal = {
            id: Date.now().toString(),
            type: 'workout_frequency',
            title: '3 workouts per week',
            target: 3,
            unit: 'workouts',
            current: workoutLogs.filter((w) => new Date(w.date) >= weekAgo).length,
            period: 'weekly',
            startDate: now.toISOString().split('T')[0],
            endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          };
          addGoal(goal);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function exportData() {
    Alert.alert(
      'Export Data',
      `${workoutLogs.length} workout logs, ${foodLogs.length} food logs ready for export.\n\nIn a production build, this would save a CSV/PDF file.`
    );
  }

  const totalWorkouts = workoutLogs.length;
  const thisWeekWorkouts = workoutLogs.filter((w) => {
    const d = new Date(w.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={handleEditToggle}
            style={[styles.editBtn, editMode && styles.editBtnSave]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={editMode ? 'checkmark' : 'pencil'}
              size={14}
              color={editMode ? Colors.background : Colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.editBtnText, editMode && styles.editBtnTextSave]}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{thisWeekWorkouts}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>{foodLogs.length}</Text>
            <Text style={styles.statLabel}>Food Logs</Text>
          </Card>
        </View>

        {/* Body Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Body Info</Text>

          <View style={styles.fieldGrid}>
            <ProfileField
              label="Name"
              value={form.name}
              editable={editMode}
              onEdit={(v) => setForm({ ...form, name: v })}
              placeholder="Your name"
            />
            <ProfileField
              label="Age"
              value={String(form.age)}
              editable={editMode}
              onEdit={(v) => setForm({ ...form, age: Number(v) || 25 })}
              keyboardType="number-pad"
            />
            <ProfileField
              label="Height (cm)"
              value={String(form.height)}
              editable={editMode}
              onEdit={(v) => setForm({ ...form, height: Number(v) || 175 })}
              keyboardType="decimal-pad"
            />
            <ProfileField
              label="Weight (kg)"
              value={String(form.weight)}
              editable={editMode}
              onEdit={(v) => setForm({ ...form, weight: Number(v) || 70 })}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {(['male', 'female', 'other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                disabled={!editMode}
                style={[styles.chip, form.gender === g && styles.chipActive]}
                onPress={() => setForm({ ...form, gender: g })}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                  {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Fitness Level</Text>
          <View style={styles.chipRow}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                disabled={!editMode}
                style={[styles.chip, form.fitnessLevel === lvl && styles.chipActive]}
                onPress={() => setForm({ ...form, fitnessLevel: lvl })}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, form.fitnessLevel === lvl && styles.chipTextActive]}
                >
                  {lvl === 'beginner'
                    ? 'Beginner'
                    : lvl === 'intermediate'
                    ? 'Intermediate'
                    : 'Advanced'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Goals */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <TouchableOpacity onPress={handleAddGoal} style={styles.addGoalBtn} activeOpacity={0.7}>
              <Text style={styles.addGoalBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {profile.goals.length === 0 ? (
            <Text style={styles.emptyText}>No goals set yet</Text>
          ) : null}

          {profile.goals.map((goal) => {
            const progress = Math.min(goal.current / goal.target, 1);
            return (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <TouchableOpacity onPress={() => deleteGoal(goal.id)} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalProgressText}>
                    {goal.current} / {goal.target} {goal.unit}
                  </Text>
                  <Text style={styles.goalProgressPct}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.goalTrack}>
                  <View
                    style={[
                      styles.goalFill,
                      { width: `${progress * 100}%`, backgroundColor: Colors.primary },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        {/* API Key */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI Settings</Text>
          <Text style={styles.apiKeyNote}>
            Enter your Anthropic API key to enable Claude AI analysis
          </Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={styles.apiKeyInput}
              value={form.anthropicApiKey}
              onChangeText={(v) => setForm({ ...form, anthropicApiKey: v })}
              placeholder="sk-ant-..."
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowApiKey(!showApiKey)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showApiKey ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.saveApiBtn}
            onPress={() => {
              updateProfile({ anthropicApiKey: form.anthropicApiKey });
              Alert.alert('Saved', 'API key saved.');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.saveApiBtnText}>Save API Key</Text>
          </TouchableOpacity>
        </Card>

        {/* Data Export */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={exportData} activeOpacity={0.7}>
            <View style={styles.exportIconWrap}>
              <Ionicons name="download-outline" size={22} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exportTitle}>Export Data</Text>
              <Text style={styles.exportSubtitle}>
                Export workout, food & sleep logs as CSV
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.footer}>HealthTimer v1.0 · Powered by Claude AI</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileField({
  label,
  value,
  editable,
  onEdit,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  editable: boolean;
  onEdit: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onEdit}
          placeholder={placeholder ?? label}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
        />
      ) : (
        <Text style={fieldStyles.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  value: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  input: {
    color: Colors.text,
    fontSize: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnSave: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  editBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  editBtnTextSave: { color: Colors.background },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },

  sectionCard: { marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addGoalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  addGoalBtnText: { color: Colors.background, fontSize: 13, fontWeight: '700' },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 8 },

  fieldGrid: { marginBottom: 8 },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 14 },
  chipTextActive: { color: Colors.background, fontWeight: '700' },

  goalItem: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  goalProgress: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalProgressText: { color: Colors.textSecondary, fontSize: 13 },
  goalProgressPct: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  goalTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 3 },

  apiKeyNote: { color: Colors.textSecondary, fontSize: 13, marginBottom: 12, lineHeight: 18 },
  apiKeyRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  apiKeyInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyeBtn: {
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveApiBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveApiBtnText: { color: Colors.background, fontWeight: '700', fontSize: 15 },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  exportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.accent}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportTitle: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  exportSubtitle: { color: Colors.textSecondary, fontSize: 13 },

  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});

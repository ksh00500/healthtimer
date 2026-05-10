import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { RecoveryBar } from '../../src/components/RecoveryBar';
import { StatCard } from '../../src/components/StatCard';
import { Card } from '../../src/components/Card';
import { getRecoveryProgress, getRemainingHours } from '../../src/utils/recovery';
import { MUSCLE_DEFAULTS, MuscleGroup } from '../../src/types';
import { todayStr } from '../../src/utils/date';
import { generateDailyAnalysis } from '../../src/utils/claude';

const WARNING_COLORS: Record<string, string> = {
  none: Colors.success,
  caution: Colors.warning,
  warning: Colors.danger,
};

export default function DashboardScreen() {
  const { muscleTimers, profile, foodLogs, sleepLogs, aiAnalysis, setAiAnalysis } = useAppStore();
  const [analyzing, setAnalyzing] = useState(false);

  const today = todayStr();
  const todayFood = foodLogs.filter((f) => f.date === today);
  const totalCalories = todayFood.reduce((s, f) => s + f.totalCalories, 0);
  const totalProtein = todayFood.reduce((s, f) => s + f.totalProtein, 0);
  const lastSleep = sleepLogs[0] ?? null;

  const topRecovering = [...muscleTimers]
    .filter((t) => t.lastWorkedAt !== null)
    .sort((a, b) => getRemainingHours(b, profile) - getRemainingHours(a, profile))
    .slice(0, 3);

  async function runAnalysis() {
    if (!profile.anthropicApiKey) {
      Alert.alert('API Key Required', 'Please enter your Anthropic API key in the Profile tab.');
      return;
    }
    setAnalyzing(true);
    try {
      const analysis = await generateDailyAnalysis(
        profile.anthropicApiKey,
        muscleTimers,
        lastSleep,
        todayFood[0] ?? null,
        profile
      );
      setAiAnalysis(analysis);
    } catch {
      Alert.alert('Analysis Failed', 'Please check your API key and try again.');
    } finally {
      setAnalyzing(false);
    }
  }

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
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity
            onPress={runAnalysis}
            disabled={analyzing}
            style={styles.analyzeBtn}
            activeOpacity={0.7}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color={Colors.primary} />
                <Text style={styles.analyzeBtnText}>AI Analysis</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Status Card */}
        {aiAnalysis ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: WARNING_COLORS[aiAnalysis.warningLevel] ?? Colors.success },
                ]}
              />
              <Text style={styles.statusTag}>Today's Status</Text>
              <TouchableOpacity onPress={runAnalysis} disabled={analyzing} style={styles.refreshBtn} activeOpacity={0.7}>
                <Ionicons name="refresh" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.statusTitle}>{aiAnalysis.statusTitle}</Text>
            <Text style={styles.statusDesc}>{aiAnalysis.statusDescription}</Text>
            <View style={styles.divider} />
            <Text style={styles.recommendation}>{aiAnalysis.recommendation}</Text>
            {aiAnalysis.warningLevel !== 'none' && aiAnalysis.warningMessage ? (
              <View
                style={[
                  styles.warningBox,
                  { borderColor: WARNING_COLORS[aiAnalysis.warningLevel] },
                ]}
              >
                <Ionicons
                  name="warning"
                  size={14}
                  color={WARNING_COLORS[aiAnalysis.warningLevel]}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.warningText,
                    { color: WARNING_COLORS[aiAnalysis.warningLevel] },
                  ]}
                >
                  {aiAnalysis.warningMessage}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <TouchableOpacity onPress={runAnalysis} disabled={analyzing} activeOpacity={0.7}>
            <Card style={styles.emptyCard}>
              {analyzing ? (
                <>
                  <ActivityIndicator color={Colors.primary} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="sparkles" size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.emptyText}>Start AI Analysis</Text>
                  <Text style={styles.emptySubtext}>
                    Get personalized recovery and workout guidance
                  </Text>
                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>Tap to analyze</Text>
                  </View>
                </>
              )}
            </Card>
          </TouchableOpacity>
        )}

        {/* Recovery Section */}
        {topRecovering.length > 0 ? (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recovery</Text>
              <Text style={styles.sectionSub}>{topRecovering.length} muscles tracked</Text>
            </View>
            {topRecovering.map((t) => (
              <RecoveryBar
                key={t.group}
                label={MUSCLE_DEFAULTS[t.group as MuscleGroup].label}
                progress={getRecoveryProgress(t, profile)}
                remainingHours={getRemainingHours(t, profile)}
                color={MUSCLE_DEFAULTS[t.group as MuscleGroup].color}
              />
            ))}
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recovery</Text>
            <Text style={styles.emptySubtext}>
              No muscles tracked yet. Log a workout in the Add tab.
            </Text>
          </Card>
        )}

        {/* Nutrition Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Calories"
            value={totalCalories}
            unit="kcal"
            target={`${profile.weight * 30} kcal`}
            color={Colors.primary}
          />
          <View style={styles.statGap} />
          <StatCard
            label="Protein"
            value={totalProtein}
            unit="g"
            target={`${profile.weight * 2} g`}
            color={Colors.accent}
          />
        </View>

        {/* Sleep Summary */}
        {lastSleep ? (
          <Card style={styles.sleepCard}>
            <View style={styles.sleepRow}>
              <View style={styles.sleepIconWrap}>
                <Ionicons name="moon" size={20} color={Colors.purple} />
              </View>
              <View style={styles.sleepInfo}>
                <Text style={styles.sleepTitle}>Last Sleep</Text>
                <Text style={styles.sleepData}>
                  {lastSleep.totalHours}h total · {lastSleep.deepSleepHours}h deep ·{' '}
                  {lastSleep.quality}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 44,
    justifyContent: 'center',
  },
  analyzeBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  statusCard: { marginBottom: 16 },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusTag: { color: Colors.textSecondary, fontSize: 12, flex: 1 },
  refreshBtn: { padding: 4 },
  statusTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statusDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  recommendation: { color: Colors.text, fontSize: 14, lineHeight: 22 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.background,
  },
  warningText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 18 },

  emptyCard: { alignItems: 'center', paddingVertical: 36, marginBottom: 16 },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
  tapHint: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  tapHintText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  sectionCard: { marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  sectionSub: { color: Colors.textMuted, fontSize: 12 },

  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statGap: { width: 12 },

  sleepCard: { marginBottom: 16 },
  sleepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sleepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.purple}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepInfo: { flex: 1 },
  sleepTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  sleepData: { color: Colors.textSecondary, fontSize: 13 },
});

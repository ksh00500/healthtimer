import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { RecoveryBar } from '../../src/components/RecoveryBar';
import { StatCard } from '../../src/components/StatCard';
import { Card } from '../../src/components/Card';
import { getRecoveryProgress, getRemainingHours } from '../../src/utils/recovery';
import { MUSCLE_DEFAULTS, MuscleGroup } from '../../src/types';
import { todayStr } from '../../src/utils/date';
import { generateDailyAnalysis } from '../../src/utils/claude';

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

  const needsRefresh = !aiAnalysis || aiAnalysis.date !== today;

  async function runAnalysis() {
    if (!profile.anthropicApiKey) {
      Alert.alert('API Key 필요', 'Profile 탭에서 Anthropic API Key를 입력해주세요.');
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
    } catch (e) {
      Alert.alert('분석 실패', '다시 시도해주세요.');
    } finally {
      setAnalyzing(false);
    }
  }

  const warningColors: Record<string, string> = {
    none: Colors.success,
    caution: Colors.warning,
    warning: Colors.danger,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={runAnalysis} disabled={analyzing} style={styles.analyzeBtn}>
            {analyzing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.analyzeBtnText}>✦ AI 분석</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Status Card */}
        {aiAnalysis ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusDot, { backgroundColor: warningColors[aiAnalysis.warningLevel] }]} />
              <Text style={styles.statusTag}>오늘의 상태</Text>
            </View>
            <Text style={styles.statusTitle}>{aiAnalysis.statusTitle}</Text>
            <Text style={styles.statusDesc}>{aiAnalysis.statusDescription}</Text>
            <View style={styles.divider} />
            <Text style={styles.recommendation}>{aiAnalysis.recommendation}</Text>
            {aiAnalysis.warningLevel !== 'none' && aiAnalysis.warningMessage ? (
              <View style={[styles.warningBox, { borderColor: warningColors[aiAnalysis.warningLevel] }]}>
                <Text style={[styles.warningText, { color: warningColors[aiAnalysis.warningLevel] }]}>
                  ⚠ {aiAnalysis.warningMessage}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <TouchableOpacity onPress={runAnalysis} disabled={analyzing}>
            <Card style={styles.emptyCard}>
              {analyzing ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.emptyIcon}>✦</Text>
                  <Text style={styles.emptyText}>AI 분석 시작하기</Text>
                  <Text style={styles.emptySubtext}>오늘의 컨디션과 운동 가이드를 받아보세요</Text>
                </>
              )}
            </Card>
          </TouchableOpacity>
        )}

        {/* Recovery Section */}
        {topRecovering.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recovery</Text>
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
        )}

        {/* Nutrition Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="🔥"
            label="Calories"
            value={totalCalories}
            unit="kcal"
            target={`${profile.weight * 30}kcal`}
            color={Colors.primary}
          />
          <View style={styles.statGap} />
          <StatCard
            icon="⚡"
            label="Protein"
            value={totalProtein}
            unit="g"
            target={`${profile.weight * 2}g`}
            color={Colors.accent}
          />
        </View>

        {/* Sleep Summary */}
        {lastSleep && (
          <Card style={styles.sleepCard}>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepIcon}>🌙</Text>
              <View>
                <Text style={styles.sleepTitle}>Last Sleep</Text>
                <Text style={styles.sleepData}>
                  {lastSleep.totalHours}h total · {lastSleep.deepSleepHours}h deep · {lastSleep.quality}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  analyzeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  analyzeBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  statusCard: { marginBottom: 16 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusTag: { color: Colors.textSecondary, fontSize: 12 },
  statusTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statusDesc: { color: Colors.textSecondary, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  recommendation: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  warningBox: { marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  warningText: { fontSize: 13, fontWeight: '500' },

  emptyCard: { alignItems: 'center', paddingVertical: 32, marginBottom: 16 },
  emptyIcon: { fontSize: 32, marginBottom: 8, color: Colors.primary },
  emptyText: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  emptySubtext: { color: Colors.textSecondary, fontSize: 13 },

  sectionCard: { marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 16 },

  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statGap: { width: 12 },

  sleepCard: { marginBottom: 16 },
  sleepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sleepIcon: { fontSize: 24 },
  sleepTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  sleepData: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
});

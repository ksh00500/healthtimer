import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store';
import { Colors } from '../../src/components/Colors';
import { Card } from '../../src/components/Card';
import { MUSCLE_DEFAULTS, MuscleGroup } from '../../src/types';
import { getWeekDays, formatDayLabel, formatDayNumber, formatMonthYear, isSameDay, todayStr } from '../../src/utils/date';
import { addDays, subDays } from 'date-fns';

export default function ActivityScreen() {
  const { workoutLogs, foodLogs } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(new Date());

  const weekDays = getWeekDays(weekStart);

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const selectedWorkouts = workoutLogs.filter((w) => w.date === selectedDateStr);
  const selectedFood = foodLogs.filter((f) => f.date === selectedDateStr);

  const totalVolumeToday = selectedWorkouts.reduce((s, w) => s + w.totalVolume, 0);
  const totalCaloriesToday = selectedFood.reduce((s, f) => s + f.totalCalories, 0);

  function hasMuscleOnDay(date: Date): MuscleGroup[] {
    const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const logs = workoutLogs.filter((w) => w.date === ds);
    const groups = new Set<MuscleGroup>();
    logs.forEach((l) => l.muscleGroups.forEach((g) => groups.add(g)));
    return Array.from(groups);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.monthLabel}>{formatMonthYear(selectedDate)}</Text>
      </View>

      {/* Week navigator */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekStart((d) => subDays(d, 7))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.weekDays}>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const muscles = hasMuscleOnDay(day);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {formatDayLabel(day)}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected, isToday && styles.dayNumberToday]}>
                  {formatDayNumber(day)}
                </Text>
                {muscles.length > 0 && (
                  <View style={styles.dotRow}>
                    {muscles.slice(0, 3).map((m) => (
                      <View key={m} style={[styles.dot, { backgroundColor: MUSCLE_DEFAULTS[m].color }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity onPress={() => setWeekStart((d) => addDays(d, 7))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily stats */}
        {(totalVolumeToday > 0 || totalCaloriesToday > 0) && (
          <View style={styles.statsRow}>
            {totalVolumeToday > 0 && (
              <Card style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>TOTAL VOLUME</Text>
                <Text style={styles.miniStatValue}>
                  {totalVolumeToday.toLocaleString()}
                  <Text style={styles.miniStatUnit}> kg</Text>
                </Text>
              </Card>
            )}
            {totalCaloriesToday > 0 && (
              <Card style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>CALORIES IN</Text>
                <Text style={[styles.miniStatValue, { color: Colors.primary }]}>
                  {totalCaloriesToday.toLocaleString()}
                  <Text style={styles.miniStatUnit}> kcal</Text>
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* Log section */}
        <Text style={styles.logTitle}>
          {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} LOG
        </Text>

        {selectedWorkouts.length === 0 && selectedFood.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>이 날의 기록이 없습니다</Text>
            <Text style={styles.emptySubtext}>+ 탭에서 운동이나 식단을 기록해보세요</Text>
          </Card>
        )}

        {selectedWorkouts.map((workout) => (
          <Card key={workout.id} style={styles.logCard}>
            <View style={styles.logCardHeader}>
              <View style={[styles.logIcon, { backgroundColor: Colors.primary + '22' }]}>
                <Text style={styles.logIconText}>💪</Text>
              </View>
              <View style={styles.logMeta}>
                <Text style={styles.logTime}>
                  {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            <Text style={styles.logCardTitle}>
              {workout.muscleGroups.map((g) => MUSCLE_DEFAULTS[g as MuscleGroup].label).join(' + ')} 운동
            </Text>
            <Text style={styles.logCardSub}>
              {workout.durationMinutes}분 · {workout.exercises.length}개 종목
            </Text>
            <View style={styles.muscleTags}>
              {workout.muscleGroups.map((g) => (
                <View key={g} style={[styles.muscleTag, { backgroundColor: MUSCLE_DEFAULTS[g as MuscleGroup].color + '33' }]}>
                  <Text style={[styles.muscleTagText, { color: MUSCLE_DEFAULTS[g as MuscleGroup].color }]}>
                    {MUSCLE_DEFAULTS[g as MuscleGroup].label}
                  </Text>
                </View>
              ))}
            </View>
            {workout.notes ? <Text style={styles.notes}>{workout.notes}</Text> : null}
          </Card>
        ))}

        {selectedFood.map((food) => (
          <Card key={food.id} style={styles.logCard}>
            <View style={styles.logCardHeader}>
              <View style={[styles.logIcon, { backgroundColor: Colors.warning + '22' }]}>
                <Text style={styles.logIconText}>🍽</Text>
              </View>
            </View>
            <Text style={styles.logCardTitle}>
              {food.mealType === 'breakfast' ? '아침' : food.mealType === 'lunch' ? '점심' : food.mealType === 'dinner' ? '저녁' : '간식'}
            </Text>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: Colors.primary }]}>{food.totalCalories}</Text>
                <Text style={styles.nutritionLabel}>kcal</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: Colors.accent }]}>{food.totalProtein}g</Text>
                <Text style={styles.nutritionLabel}>단백질</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: Colors.purple }]}>{food.totalCarbs}g</Text>
                <Text style={styles.nutritionLabel}>탄수화물</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: Colors.warning }]}>{food.totalFat}g</Text>
                <Text style={styles.nutritionLabel}>지방</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  monthLabel: { color: Colors.textSecondary, fontSize: 15 },

  weekNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 16 },
  navBtn: { padding: 12 },
  navBtnText: { color: Colors.textSecondary, fontSize: 24 },
  weekDays: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  dayCell: { alignItems: 'center', padding: 8, borderRadius: 16, minWidth: 40 },
  dayCellSelected: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary },
  dayLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  dayLabelSelected: { color: Colors.primary },
  dayNumber: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  dayNumberSelected: { color: Colors.text },
  dayNumberToday: { color: Colors.primary },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  miniStat: { flex: 1 },
  miniStatLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginBottom: 4 },
  miniStatValue: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  miniStatUnit: { fontSize: 12, color: Colors.textSecondary, fontWeight: '400' },

  logTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },

  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: Colors.textSecondary, fontSize: 15, marginBottom: 4 },
  emptySubtext: { color: Colors.textMuted, fontSize: 13 },

  logCard: { marginBottom: 12 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  logIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logIconText: { fontSize: 20 },
  logMeta: { alignItems: 'flex-end' },
  logTime: { color: Colors.textMuted, fontSize: 12 },
  logCardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  logCardSub: { color: Colors.textSecondary, fontSize: 13, marginBottom: 10 },

  muscleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  muscleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  muscleTagText: { fontSize: 12, fontWeight: '600' },

  notes: { color: Colors.textMuted, fontSize: 13, marginTop: 8, fontStyle: 'italic' },

  nutritionRow: { flexDirection: 'row', gap: 12 },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { fontSize: 16, fontWeight: '700' },
  nutritionLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});

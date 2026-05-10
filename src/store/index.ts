import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MuscleGroup, MuscleTimer, WorkoutLog, FoodLog, SleepLog, UserProfile, AiAnalysis, MUSCLE_DEFAULTS, Goal } from '../types';

interface AppState {
  // Muscle timers
  muscleTimers: MuscleTimer[];
  setMuscleWorked: (group: MuscleGroup) => void;
  adjustTimerHours: (group: MuscleGroup, delta: number) => void;
  resetTimer: (group: MuscleGroup) => void;

  // Workout logs
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => void;
  deleteWorkoutLog: (id: string) => void;

  // Food logs
  foodLogs: FoodLog[];
  addFoodLog: (log: FoodLog) => void;
  deleteFoodLog: (id: string) => void;

  // Sleep logs
  sleepLogs: SleepLog[];
  addSleepLog: (log: SleepLog) => void;

  // User profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // AI Analysis
  aiAnalysis: AiAnalysis | null;
  setAiAnalysis: (analysis: AiAnalysis) => void;
}

const defaultTimers: MuscleTimer[] = (Object.keys(MUSCLE_DEFAULTS) as MuscleGroup[]).map((group) => ({
  group,
  label: MUSCLE_DEFAULTS[group].label,
  baseHours: MUSCLE_DEFAULTS[group].baseHours,
  lastWorkedAt: null,
  customHours: null,
}));

const defaultProfile: UserProfile = {
  name: '',
  height: 175,
  weight: 70,
  age: 25,
  gender: 'male',
  fitnessLevel: 'intermediate',
  goals: [],
  anthropicApiKey: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      muscleTimers: defaultTimers,

      setMuscleWorked: (group) =>
        set((state) => ({
          muscleTimers: state.muscleTimers.map((t) =>
            t.group === group ? { ...t, lastWorkedAt: new Date().toISOString(), customHours: null } : t
          ),
        })),

      adjustTimerHours: (group, delta) =>
        set((state) => ({
          muscleTimers: state.muscleTimers.map((t) => {
            if (t.group !== group) return t;
            const current = t.customHours ?? t.baseHours;
            const adjusted = Math.max(1, Math.min(168, current + delta));
            return { ...t, customHours: adjusted };
          }),
        })),

      resetTimer: (group) =>
        set((state) => ({
          muscleTimers: state.muscleTimers.map((t) =>
            t.group === group ? { ...t, lastWorkedAt: null, customHours: null } : t
          ),
        })),

      workoutLogs: [],
      addWorkoutLog: (log) =>
        set((state) => ({ workoutLogs: [log, ...state.workoutLogs] })),
      deleteWorkoutLog: (id) =>
        set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) })),

      foodLogs: [],
      addFoodLog: (log) =>
        set((state) => ({ foodLogs: [log, ...state.foodLogs] })),
      deleteFoodLog: (id) =>
        set((state) => ({ foodLogs: state.foodLogs.filter((l) => l.id !== id) })),

      sleepLogs: [],
      addSleepLog: (log) =>
        set((state) => ({ sleepLogs: [log, ...state.sleepLogs] })),

      profile: defaultProfile,
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      addGoal: (goal) =>
        set((state) => ({ profile: { ...state.profile, goals: [...state.profile.goals, goal] } })),
      updateGoal: (id, updates) =>
        set((state) => ({
          profile: {
            ...state.profile,
            goals: state.profile.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          },
        })),
      deleteGoal: (id) =>
        set((state) => ({
          profile: { ...state.profile, goals: state.profile.goals.filter((g) => g.id !== id) },
        })),

      aiAnalysis: null,
      setAiAnalysis: (analysis) => set({ aiAnalysis: analysis }),
    }),
    {
      name: 'healthtimer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

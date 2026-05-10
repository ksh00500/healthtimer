export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export interface MuscleTimer {
  group: MuscleGroup;
  label: string;
  baseHours: number;
  lastWorkedAt: string | null;
  customHours: number | null;
}

export interface WorkoutLog {
  id: string;
  date: string;
  muscleGroups: MuscleGroup[];
  durationMinutes: number;
  exercises: Exercise[];
  totalVolume: number;
  notes: string;
  intensity: 'light' | 'moderate' | 'heavy';
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  muscleGroup: MuscleGroup;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface FoodLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
  isFavorite: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalHours: number;
  deepSleepHours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface UserProfile {
  name: string;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: Goal[];
  anthropicApiKey: string;
}

export interface Goal {
  id: string;
  type: 'workout_frequency' | 'weight_loss' | 'muscle_gain' | 'cardio';
  title: string;
  target: number;
  unit: string;
  current: number;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface AiAnalysis {
  date: string;
  statusTitle: string;
  statusDescription: string;
  recommendation: string;
  warningLevel: 'none' | 'caution' | 'warning';
  warningMessage: string;
}

export const MUSCLE_DEFAULTS: Record<MuscleGroup, { label: string; baseHours: number; color: string }> = {
  chest: { label: 'Chest', baseHours: 48, color: '#EC4899' },
  back: { label: 'Back', baseHours: 48, color: '#14B8A6' },
  legs: { label: 'Legs', baseHours: 72, color: '#F97316' },
  shoulders: { label: 'Shoulders', baseHours: 48, color: '#8B5CF6' },
  arms: { label: 'Arms', baseHours: 24, color: '#3B82F6' },
  core: { label: 'Core', baseHours: 24, color: '#10B981' },
};

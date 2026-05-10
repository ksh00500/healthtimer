import { MuscleTimer, UserProfile } from '../types';

export function getRecoveryHours(timer: MuscleTimer, profile: UserProfile): number {
  let hours = timer.customHours ?? timer.baseHours;

  // Body weight correction: heavier → longer recovery
  const weightFactor = profile.weight > 80 ? 1.1 : profile.weight < 60 ? 0.9 : 1.0;
  // Age correction: older → longer recovery
  const ageFactor = profile.age > 40 ? 1.15 : profile.age < 25 ? 0.95 : 1.0;
  // Fitness level correction: advanced recover faster
  const fitnessFactor =
    profile.fitnessLevel === 'advanced' ? 0.85 :
    profile.fitnessLevel === 'beginner' ? 1.15 : 1.0;

  return Math.round(hours * weightFactor * ageFactor * fitnessFactor);
}

export function getElapsedHours(lastWorkedAt: string | null): number {
  if (!lastWorkedAt) return Infinity;
  const elapsed = (Date.now() - new Date(lastWorkedAt).getTime()) / (1000 * 60 * 60);
  return elapsed;
}

export function getRecoveryProgress(timer: MuscleTimer, profile: UserProfile): number {
  const totalHours = getRecoveryHours(timer, profile);
  const elapsed = getElapsedHours(timer.lastWorkedAt);
  if (elapsed === Infinity) return 1;
  return Math.min(elapsed / totalHours, 1);
}

export function getRemainingHours(timer: MuscleTimer, profile: UserProfile): number {
  const totalHours = getRecoveryHours(timer, profile);
  const elapsed = getElapsedHours(timer.lastWorkedAt);
  if (elapsed === Infinity) return 0;
  return Math.max(0, Math.ceil(totalHours - elapsed));
}

export function isRecovered(timer: MuscleTimer, profile: UserProfile): boolean {
  return getRecoveryProgress(timer, profile) >= 1;
}

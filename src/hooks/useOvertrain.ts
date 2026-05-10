import { MuscleGroup, MuscleTimer, UserProfile } from '../types';
import { getRemainingHours, isRecovered } from '../utils/recovery';
import { MUSCLE_DEFAULTS } from '../types';

export interface OvertainWarning {
  group: MuscleGroup;
  remainingHours: number;
  severity: 'caution' | 'danger';
}

export function checkOvertrain(
  muscleGroups: MuscleGroup[],
  timers: MuscleTimer[],
  profile: UserProfile
): OvertainWarning[] {
  return muscleGroups.flatMap((group) => {
    const timer = timers.find((t) => t.group === group);
    if (!timer || isRecovered(timer, profile)) return [];

    const remaining = getRemainingHours(timer, profile);
    const severity = remaining > 12 ? 'danger' : 'caution';
    return [{ group, remainingHours: remaining, severity }];
  });
}

export function formatOvertainWarning(warnings: OvertainWarning[]): string {
  if (warnings.length === 0) return '';
  const lines = warnings.map((w) => {
    const label = MUSCLE_DEFAULTS[w.group].label;
    return `• ${label}: ${w.remainingHours}h 회복 필요`;
  });
  return `아직 완전히 회복되지 않은 근육 부위:\n${lines.join('\n')}\n\n무리한 훈련은 부상으로 이어질 수 있습니다.`;
}

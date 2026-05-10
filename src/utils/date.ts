import { format, isToday, parseISO, startOfWeek, addDays } from 'date-fns';

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'hh:mm a');
}

export function getWeekDays(referenceDate: Date = new Date()): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === 'string' ? parseISO(a) : a;
  const db = typeof b === 'string' ? parseISO(b) : b;
  return format(da, 'yyyy-MM-dd') === format(db, 'yyyy-MM-dd');
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEE').toUpperCase();
}

export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMM yyyy');
}

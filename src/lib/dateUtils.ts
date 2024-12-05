import { startOfDay as dateFnsStartOfDay, endOfDay as dateFnsEndOfDay, subDays } from 'date-fns';
import { WeekDay } from '@/types';

export function toTimestamp(date: Date | string): number {
  return new Date(date).getTime();
}

export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

export function startOfDay(date: Date | string | number): Date {
  return dateFnsStartOfDay(new Date(date));
}

export function endOfDay(date: Date | string | number): Date {
  return dateFnsEndOfDay(new Date(date));
}

export function startOfDayTimestamp(date: Date | string | number): number {
  return startOfDay(date).getTime();
}

export function endOfDayTimestamp(date: Date | string | number): number {
  return endOfDay(date).getTime();
}

export function getCurrentTimestamp(): number {
  return Date.now();
}

export function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return startOfDay(today).getTime() === startOfDay(date).getTime();
}

export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  return startOfDay(timestamp1).getTime() === startOfDay(timestamp2).getTime();
}

const WEEKDAYS: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export function getPreviousDay(date: Date, orderDays: WeekDay[]): Date {
  if (!orderDays.length) return date;

  let currentDate = subDays(date, 1);
  let attempts = 7; // Prevent infinite loop

  while (attempts > 0) {
    const dayName = WEEKDAYS[currentDate.getDay()];
    if (orderDays.includes(dayName)) {
      return currentDate;
    }
    currentDate = subDays(currentDate, 1);
    attempts--;
  }

  return date; // Fallback to current date if no previous order day found
}

export function getDayName(date: Date): WeekDay {
  return WEEKDAYS[date.getDay()];
}
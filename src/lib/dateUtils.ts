import { startOfDay as dateFnsStartOfDay, endOfDay as dateFnsEndOfDay, subDays } from 'date-fns';
import { WeekDay } from '@/types';

export function startOfDay(date: Date): Date {
  return dateFnsStartOfDay(date);
}

export function endOfDay(date: Date): Date {
  return dateFnsEndOfDay(date);
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getPreviousDay(date: Date, orderDays: WeekDay[]): Date {
  if (!orderDays.length) return date;

  let currentDate = subDays(date, 1);
  let attempts = 7; // Prevent infinite loop

  while (attempts > 0) {
    const dayName = WEEKDAYS[currentDate.getDay()];
    if (orderDays.includes(dayName as WeekDay)) {
      return currentDate;
    }
    currentDate = subDays(currentDate, 1);
    attempts--;
  }

  return date; // Fallback to current date if no previous order day found
}
import { Order } from '@/types';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyOrdersCount {
  date: string;
  count: number;
}

export function calculateWeeklyOrders(orders: Order[]): WeeklyOrdersCount[] {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const weeklyOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= weekStart && orderDate <= weekEnd;
  });

  const countByDate = weeklyOrders.reduce((acc, order) => {
    const date = new Date(order.date).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(countByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
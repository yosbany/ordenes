import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { startOfDayTimestamp, endOfDayTimestamp, getCurrentTimestamp } from '@/lib/dateUtils';

export function useTodayOrdersCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);

        if (!snapshot.exists()) {
          setCount(0);
          return;
        }

        const todayStart = startOfDayTimestamp(getCurrentTimestamp());
        const todayEnd = endOfDayTimestamp(getCurrentTimestamp());

        const orders = Object.values(snapshot.val()) as Order[];
        const todayOrders = orders.filter(order => 
          order.date >= todayStart && order.date <= todayEnd
        );

        setCount(todayOrders.length);
      } catch (error) {
        console.error('Error fetching today orders count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayOrders();
  }, []);

  return { count, loading };
}
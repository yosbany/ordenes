
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export function useGlobalOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Order, 'id'>)
      }));

      // Sort orders by date in descending order
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setOrders(sortedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { orders, loading };
}
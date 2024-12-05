import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { getProviderOrders } from '@/lib/services/orders';

export function useProviderOrders(providerId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const data = await getProviderOrders(providerId);
        if (mounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching provider orders:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (providerId) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [providerId]);

  return { orders, loading };
}
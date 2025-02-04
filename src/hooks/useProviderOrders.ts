import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/lib/services/orders';
import { toast } from 'react-hot-toast';

export function useProviderOrders(providerId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const loadOrders = async () => {
      if (!providerId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        // Subscribe to real-time updates
        unsubscribe = orderService.subscribeToProviderOrders(providerId, (updatedOrders) => {
          if (mounted) {
            setOrders(updatedOrders);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading provider orders:', error);
        if (mounted) {
          toast.error('Error al cargar las órdenes');
          setOrders([]);
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [providerId]);

  return { orders, loading };
}
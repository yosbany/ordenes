import { useState, useEffect } from 'react';
import { orderService } from '@/lib/services/orders';
import { Order } from '@/types';
import { toast } from 'react-hot-toast';

export function useOrders(providerId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      if (!providerId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        // Initial load
        const initialOrders = await orderService.getByProvider(providerId);
        if (initialOrders) {
          setOrders(initialOrders);
        }

        // Setup real-time subscription
        unsubscribe = orderService.subscribeToProviderOrders(providerId, (updatedOrders) => {
          console.log('Orders updated:', updatedOrders);
          setOrders(updatedOrders);
        });
      } catch (error) {
        console.error('Error setting up orders subscription:', error);
        toast.error('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [providerId]);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      return await orderService.create(order);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
      throw error;
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await orderService.update(id, order);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar la orden');
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderService.delete(id);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar la orden');
      throw error;
    }
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
  };
}
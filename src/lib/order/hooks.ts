import { useState, useCallback } from 'react';
import { Order, Product } from '@/types';
import { saveOrder } from './database';
import { createOrder } from './calculations';
import { validateOrder } from './validation';
import { toast } from 'react-hot-toast';

export function useOrderManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveOrder = useCallback(async (
    providerId: string,
    selectedProducts: Map<string, number>,
    products: Product[],
    orderId?: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Create order data
      const orderData = createOrder(providerId, selectedProducts, products);
      
      // Validate order
      const validationError = validateOrder(orderData, products);
      if (validationError) {
        toast.error(validationError);
        return false;
      }

      // Save order
      const savedOrderId = await saveOrder(orderData, orderId);
      if (!savedOrderId) {
        return false;
      }

      toast.success(orderId ? 'Orden actualizada exitosamente' : 'Orden creada exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar la orden');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    handleSaveOrder,
    isSubmitting
  };
}
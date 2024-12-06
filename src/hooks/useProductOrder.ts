import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types';
import { updateProductOrder } from '@/lib/services/database/productOrder';
import { isKnownError, getErrorMessage } from '@/lib/services/errors';

export function useProductOrder() {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateOrder = async (productId: string, newOrder: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await updateProductOrder(productId, newOrder);
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      const message = isKnownError(error) ? getErrorMessage(error) : 'Error al actualizar el orden';
      toast.error(message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    updateOrder,
    isProcessing
  };
}
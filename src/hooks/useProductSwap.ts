import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';
import { swapProductPositions, validateSwap } from '@/lib/order/swap';

export function useProductSwap(
  products: Product[],
  onUpdate: (products: Product[]) => Promise<void>
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwap = useCallback(async (
    productId: string,
    targetPosition: number
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // Validar el intercambio
      const validationError = validateSwap(products, productId, targetPosition);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Realizar el intercambio
      const updatedProducts = swapProductPositions(products, productId, targetPosition);
      await onUpdate(updatedProducts);
      toast.success('Posición actualizada correctamente');
    } catch (error) {
      console.error('Error swapping products:', error);
      toast.error('Error al actualizar la posición');
    } finally {
      setIsProcessing(false);
    }
  }, [products, onUpdate, isProcessing]);

  return {
    handleSwap,
    isProcessing
  };
}
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';
import { swapProducts } from '@/lib/order/operations';
import { getSectorFromOrder, getSectorProducts } from '@/lib/order/utils';

export function useProductOrder(initialProducts: Product[]) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwap = useCallback(async (productId: string, direction: 'prev' | 'next') => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;

      const currentSector = getSectorFromOrder(currentProduct.order);
      const sectorProducts = getSectorProducts(products, currentSector);
      const currentIndex = sectorProducts.findIndex(p => p.id === productId);
      
      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sectorProducts.length) {
        return;
      }

      const targetProduct = sectorProducts[targetIndex];
      const updatedProducts = swapProducts(products, currentProduct.id!, targetProduct.id!);
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error swapping products:', error);
      toast.error('Error al cambiar el orden');
    } finally {
      setIsProcessing(false);
    }
  }, [products, isProcessing]);

  const getUpdatedProducts = useCallback(() => products, [products]);
  
  const resetProducts = useCallback(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return {
    handleSwap,
    getUpdatedProducts,
    resetProducts,
    isProcessing
  };
}
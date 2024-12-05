import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';
import { getSectorFromOrder, getSectorProducts } from '@/lib/utils';
import { swapProducts } from '@/lib/order/reorder';
import { validateProductOrder } from '@/lib/order/validation';

export function useOrderNavigation({
  products,
  currentProduct,
  onProductsReorder
}: {
  products: Product[];
  currentProduct: Product | null;
  onProductsReorder: (products: Product[]) => Promise<void>;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNavigate = useCallback(async (direction: 'prev' | 'next') => {
    if (!currentProduct || isProcessing) return;

    setIsProcessing(true);
    try {
      const currentSector = getSectorFromOrder(currentProduct.order);
      const sectorProducts = getSectorProducts(products, currentSector);
      const currentIndex = sectorProducts.findIndex(p => p.id === currentProduct.id);
      
      // Encontrar producto objetivo
      const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sectorProducts.length) {
        return;
      }

      const targetProduct = sectorProducts[targetIndex];
      
      // Validar el intercambio
      const validationError = validateProductOrder(
        targetProduct.order,
        products,
        currentProduct.id
      );

      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Realizar el intercambio y actualizar
      const updatedProducts = swapProducts(products, currentProduct.id!, targetProduct.id!);
      await onProductsReorder(updatedProducts);
      
      toast.success('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error navigating order:', error);
      toast.error('Error al actualizar el orden');
    } finally {
      setIsProcessing(false);
    }
  }, [products, currentProduct, isProcessing, onProductsReorder]);

  // Obtener productos adyacentes
  const currentSector = currentProduct ? getSectorFromOrder(currentProduct.order) : '';
  const sectorProducts = getSectorProducts(products, currentSector);
  const currentIndex = currentProduct 
    ? sectorProducts.findIndex(p => p.id === currentProduct.id)
    : -1;

  const prevProduct = currentIndex > 0 ? sectorProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < sectorProducts.length - 1 
    ? sectorProducts[currentIndex + 1] 
    : null;

  return {
    handleNavigate,
    prevProduct,
    nextProduct,
    isProcessing,
    selectedSector: currentSector
  };
}
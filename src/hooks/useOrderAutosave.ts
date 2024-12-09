import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Order, Product } from '@/types';
import { createOrder } from '@/lib/order/calculations';
import { validateOrder } from '@/lib/order/validation';

const AUTOSAVE_INTERVAL = 60000; // 1 minute in milliseconds

export function useOrderAutosave({
  providerId,
  selectedProducts,
  products,
  onSave,
  enabled = true
}: {
  providerId: string;
  selectedProducts: Map<string, number>;
  products: Product[];
  onSave: (orderData: Omit<Order, 'id'>) => Promise<void>;
  enabled?: boolean;
}) {
  const lastSaveRef = useRef<number>(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef(false);

  // Cleanup function to clear timeout
  const cleanup = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (!enabled || !providerId || selectedProducts.size === 0) {
      cleanup();
      return;
    }

    const scheduleSave = async () => {
      // Prevent multiple concurrent saves
      if (isSavingRef.current) {
        return;
      }

      try {
        isSavingRef.current = true;

        // Create order data
        const orderData = createOrder(providerId, selectedProducts, products);
        
        // Validate order
        const validationError = validateOrder(orderData, products);
        if (validationError) {
          console.warn('Autosave skipped due to validation error:', validationError);
          return;
        }

        // Only save if there have been changes since last save
        const timeSinceLastSave = Date.now() - lastSaveRef.current;
        if (timeSinceLastSave >= AUTOSAVE_INTERVAL) {
          await onSave(orderData);
          lastSaveRef.current = Date.now();
          toast.success('Orden guardada automáticamente', {
            duration: 2000,
            position: 'bottom-right'
          });
        }
      } catch (error) {
        console.error('Error in autosave:', error);
        toast.error('Error al guardar automáticamente', {
          duration: 2000,
          position: 'bottom-right'
        });
      } finally {
        isSavingRef.current = false;
        
        // Schedule next save only if component is still mounted
        if (enabled) {
          saveTimeoutRef.current = setTimeout(scheduleSave, AUTOSAVE_INTERVAL);
        }
      }
    };

    // Start initial save cycle
    saveTimeoutRef.current = setTimeout(scheduleSave, AUTOSAVE_INTERVAL);

    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [enabled, providerId, selectedProducts, products, onSave]);

  return {
    lastSaveTime: lastSaveRef.current
  };
}
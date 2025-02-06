import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Order, Product } from '@/types';
import { createOrder } from '@/lib/order/calculations';
import { validateOrder } from '@/lib/order/validation';

const AUTOSAVE_INTERVAL = 60000; // 1 minute in milliseconds
const DEBOUNCE_DELAY = 2000; // 2 seconds debounce for rapid changes

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastDataHashRef = useRef<string>('');

  // Function to generate a hash of the current order data
  const getDataHash = () => {
    const orderData = Array.from(selectedProducts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, qty]) => `${id}:${qty}`)
      .join(',');
    return `${providerId}-${orderData}`;
  };

  // Cleanup function
  const cleanup = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = undefined;
    }
    isMountedRef.current = false;
  };

  useEffect(() => {
    // Reset mounted flag
    isMountedRef.current = true;

    // Don't start autosave if not enabled or no data to save
    if (!enabled || !providerId || selectedProducts.size === 0) {
      cleanup();
      return;
    }

    const scheduleSave = async () => {
      // Don't save if component is unmounted or already saving
      if (!isMountedRef.current || isSavingRef.current) {
        return;
      }

      try {
        // Get current data hash
        const currentHash = getDataHash();

        // Skip save if data hasn't changed
        if (currentHash === lastDataHashRef.current) {
          return;
        }

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
          
          // Update last save time and data hash only if component is still mounted
          if (isMountedRef.current) {
            lastSaveRef.current = Date.now();
            lastDataHashRef.current = currentHash;
            toast.success('Orden guardada automáticamente', {
              duration: 2000,
              position: 'bottom-right'
            });
          }
        }
      } catch (error) {
        console.error('Error in autosave:', error);
        if (isMountedRef.current) {
          toast.error('Error al guardar automáticamente', {
            duration: 2000,
            position: 'bottom-right'
          });
        }
      } finally {
        isSavingRef.current = false;
        
        // Schedule next save only if component is still mounted
        if (isMountedRef.current && enabled) {
          saveTimeoutRef.current = setTimeout(scheduleSave, AUTOSAVE_INTERVAL);
        }
      }
    };

    // Clear existing timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the save operation
    debounceTimeoutRef.current = setTimeout(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(scheduleSave, AUTOSAVE_INTERVAL);
    }, DEBOUNCE_DELAY);

    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [enabled, providerId, selectedProducts, products, onSave]);

  return {
    lastSaveTime: lastSaveRef.current
  };
}
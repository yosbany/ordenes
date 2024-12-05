import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

const SKU_PREFIX = 'M';
const SKU_PADDING = 4;

export function useSkuSuggestion() {
  const [suggestedSku, setSuggestedSku] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSku = async () => {
      try {
        const productsRef = ref(db, 'products');
        const snapshot = await get(productsRef);

        if (!snapshot.exists()) {
          setSuggestedSku(`${SKU_PREFIX}${'0'.repeat(SKU_PADDING - 1)}1`);
          return;
        }

        const products = Object.values(snapshot.val()) as Product[];
        
        // Filter products with SKUs that match our format
        const skuRegex = new RegExp(`^${SKU_PREFIX}\\d{${SKU_PADDING}}$`);
        const matchingSKUs = products
          .map(p => p.sku)
          .filter(sku => skuRegex.test(sku))
          .map(sku => parseInt(sku.slice(SKU_PREFIX.length)));

        // Find the highest number and increment
        const nextNumber = matchingSKUs.length > 0 
          ? Math.max(...matchingSKUs) + 1 
          : 1;

        // Format the new SKU
        const paddedNumber = nextNumber.toString().padStart(SKU_PADDING, '0');
        setSuggestedSku(`${SKU_PREFIX}${paddedNumber}`);
      } catch (error) {
        console.error('Error generating SKU suggestion:', error);
        setSuggestedSku('');
      } finally {
        setLoading(false);
      }
    };

    generateSku();
  }, []);

  return { suggestedSku, loading };
}
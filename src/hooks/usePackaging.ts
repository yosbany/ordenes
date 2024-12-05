import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { PACKAGING_TYPES } from '@/config/constants';

export function usePackaging() {
  const [packagingSuggestions, setPackagingSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const packagingRef = ref(db, 'packaging');
    const productsRef = ref(db, 'products');
    
    // Load custom packaging entries
    const unsubscribePackaging = onValue(packagingRef, (snapshot) => {
      const data = snapshot.val();
      const customPackaging = data ? Object.values(data) as string[] : [];
      
      // Combine with default types and sort
      const allPackaging = [...new Set([...PACKAGING_TYPES, ...customPackaging])];
      setPackagingSuggestions(allPackaging.sort());
      setLoading(false);
    });

    // Also monitor products for their packaging types
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productPackaging = Object.values(data)
          .map((product: any) => product.packaging)
          .filter(Boolean)
          .map(pkg => pkg.toUpperCase());

        // Update suggestions with new unique values
        setPackagingSuggestions(prev => {
          const newSuggestions = [...new Set([...prev, ...productPackaging])];
          return newSuggestions.sort();
        });
      }
    });

    return () => {
      unsubscribePackaging();
      unsubscribeProducts();
    };
  }, []);

  const addPackaging = async (packaging: string) => {
    const packagingRef = ref(db, 'packaging');
    const newPackagingRef = push(packagingRef);
    await set(newPackagingRef, packaging.toUpperCase());
  };

  return {
    packagingSuggestions,
    loading,
    addPackaging
  };
}
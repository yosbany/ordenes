import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export function useGlobalProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productsData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Product, 'id'>)
      }));

      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
}

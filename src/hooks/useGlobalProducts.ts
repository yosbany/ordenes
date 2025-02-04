import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

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

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const productRef = ref(db, `products/${id}`);
      await update(productRef, updates);
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
      throw error;
    }
  };

  return { 
    products, 
    loading,
    updateProduct
  };
}
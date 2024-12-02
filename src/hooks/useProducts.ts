import { useState, useEffect } from 'react';
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export function useProducts(providerId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productsRef = ref(db, 'products');
    const providerProductsQuery = query(
      productsRef,
      orderByChild('providerId'),
      equalTo(providerId)
    );

    const unsubscribe = onValue(providerProductsQuery, (snapshot) => {
      const data = snapshot.val();
      const productsList = data
        ? Object.entries(data).map(([id, product]) => ({
            id,
            ...(product as Omit<Product, 'id'>),
          }))
        : [];
      setProducts(productsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const productsRef = ref(db, 'products');
    await push(productsRef, product);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const productRef = ref(db, `products/${id}`);
    await update(productRef, updates);
  };

  const deleteProduct = async (id: string) => {
    const productRef = ref(db, `products/${id}`);
    await remove(productRef);
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
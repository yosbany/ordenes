import { useState, useEffect } from 'react';
import { ref, push, update, remove, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

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
    try {
      const productsRef = ref(db, 'products');
      const formattedProduct = {
        ...product,
        name: product.name.toUpperCase(),
        sku: product.sku.toUpperCase(),
        supplierCode: product.supplierCode?.toUpperCase() || '',
        purchasePackaging: product.purchasePackaging.toUpperCase(),
        salePackaging: product.salePackaging?.toUpperCase() || '',
        price: Number(product.price) || 0,
        minPackageStock: Number(product.minPackageStock) || 0,
        desiredStock: Number(product.desiredStock) || 0,
        order: Number(product.order) || 0,
        tags: product.tags || []
      };

      const newProductRef = await push(productsRef, formattedProduct);
      return newProductRef.key;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Error al crear el producto');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!id) {
      throw new Error('ID de producto no válido');
    }

    try {
      const productRef = ref(db, `products/${id}`);
      
      // Get current product data
      const snapshot = await get(productRef);
      if (!snapshot.exists()) {
        throw new Error('Producto no encontrado');
      }

      const currentProduct = snapshot.val();
      
      // Format updates, keeping existing values for undefined fields
      const formattedUpdates = {
        ...currentProduct,
        ...updates,
        name: updates.name?.toUpperCase() ?? currentProduct.name,
        sku: updates.sku?.toUpperCase() ?? currentProduct.sku,
        supplierCode: updates.supplierCode?.toUpperCase() ?? currentProduct.supplierCode ?? '',
        purchasePackaging: updates.purchasePackaging?.toUpperCase() ?? currentProduct.purchasePackaging,
        salePackaging: updates.salePackaging?.toUpperCase() ?? currentProduct.salePackaging ?? '',
        price: updates.price !== undefined ? Number(updates.price) : currentProduct.price,
        minPackageStock: updates.minPackageStock !== undefined ? Number(updates.minPackageStock) : currentProduct.minPackageStock,
        desiredStock: updates.desiredStock !== undefined ? Number(updates.desiredStock) : currentProduct.desiredStock,
        order: updates.order !== undefined ? Number(updates.order) : currentProduct.order,
        tags: updates.tags ?? currentProduct.tags ?? [],
        providerId: updates.providerId ?? currentProduct.providerId
      };

      // Remove any undefined or null values
      Object.keys(formattedUpdates).forEach(key => {
        if (formattedUpdates[key as keyof typeof formattedUpdates] === undefined ||
            formattedUpdates[key as keyof typeof formattedUpdates] === null) {
          delete formattedUpdates[key as keyof typeof formattedUpdates];
        }
      });

      // Perform update
      await update(productRef, formattedUpdates);

      // Verify update was successful
      const verifySnapshot = await get(productRef);
      if (!verifySnapshot.exists()) {
        throw new Error('Error al verificar la actualización');
      }

      return verifySnapshot.val();
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al actualizar el producto');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!id) {
      throw new Error('ID de producto no válido');
    }

    try {
      const productRef = ref(db, `products/${id}`);
      await remove(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Error al eliminar el producto');
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
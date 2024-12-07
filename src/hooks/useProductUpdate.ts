import { useState } from 'react';
import { Product } from '@/types';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

export function useProductUpdate() {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateProduct = async (product: Product, updates: Partial<Product>): Promise<void> => {
    if (!product.id) {
      throw new Error('Product ID is required');
    }

    setIsProcessing(true);
    try {
      const productRef = ref(db, `products/${product.id}`);
      
      // Format updates, keeping existing values for undefined fields
      const formattedUpdates = {
        ...updates,
        name: updates.name?.toUpperCase() ?? product.name,
        sku: updates.sku?.toUpperCase() ?? product.sku,
        supplierCode: updates.supplierCode?.toUpperCase() ?? product.supplierCode ?? '',
        purchasePackaging: updates.purchasePackaging?.toUpperCase() ?? product.purchasePackaging,
        salePackaging: updates.salePackaging?.toUpperCase() ?? product.salePackaging ?? '',
        price: updates.price !== undefined ? Number(updates.price) : product.price,
        minPackageStock: updates.minPackageStock !== undefined ? Number(updates.minPackageStock) : product.minPackageStock,
        desiredStock: updates.desiredStock !== undefined ? Number(updates.desiredStock) : product.desiredStock,
        order: updates.order !== undefined ? Number(updates.order) : product.order,
        tags: updates.tags ?? product.tags ?? [],
        providerId: updates.providerId ?? product.providerId
      };

      // Remove any undefined or null values
      Object.keys(formattedUpdates).forEach(key => {
        if (formattedUpdates[key as keyof typeof formattedUpdates] === undefined ||
            formattedUpdates[key as keyof typeof formattedUpdates] === null) {
          delete formattedUpdates[key as keyof typeof formattedUpdates];
        }
      });

      await update(productRef, formattedUpdates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Error al actualizar el producto');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    updateProduct,
    isProcessing
  };
}
import { useState } from 'react';
import { Product } from '@/types';
import { ref, update, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { reorderProducts } from '@/lib/order/reorder';
import { getSectorFromOrder, getSequenceFromOrder } from '@/lib/order/utils';

export function useProductUpdate() {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateProduct = async (
    product: Product,
    updates: Partial<Product>
  ): Promise<void> => {
    if (!product.id) {
      throw new Error('Product ID is required');
    }

    setIsProcessing(true);
    try {
      const productRef = ref(db, `products/${product.id}`);
      
      // Get current product data
      const snapshot = await get(productRef);
      if (!snapshot.exists()) {
        throw new Error('Product not found');
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

      // Handle reordering if order changed
      if (updates.order !== undefined && updates.order !== currentProduct.order) {
        const sector = getSectorFromOrder(updates.order);
        const position = getSequenceFromOrder(updates.order);
        
        // Get all products in the sector
        const productsRef = ref(db, 'products');
        const productsSnapshot = await get(productsRef);
        const allProducts = Object.entries(productsSnapshot.val() || {}).map(([id, data]) => ({
          id,
          ...(data as Omit<Product, 'id'>)
        }));
        
        const updatedProducts = reorderProducts(
          allProducts,
          sector,
          position,
          product.id
        );

        // Create a multi-path update
        const updates = updatedProducts
          .filter(p => p.order !== allProducts.find(op => op.id === p.id)?.order)
          .reduce((acc, p) => ({
            ...acc,
            [`products/${p.id}`]: {
              ...p,
              id: undefined // Remove id from the data to be saved
            }
          }), {});

        // Update all products in a single transaction
        await update(ref(db), updates);
      } else {
        // Just update the single product
        await update(productRef, formattedUpdates);
      }

      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    updateProduct,
    isProcessing
  };
}
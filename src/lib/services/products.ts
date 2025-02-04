import { ref, update, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';
import { DatabaseError } from './errors';

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    // First get current product data
    const productRef = ref(db, `products/${id}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      throw new DatabaseError('Product not found');
    }

    const currentProduct = snapshot.val();
    
    // Merge current data with updates
    const updatedProduct = {
      ...currentProduct,
      ...updates,
      // Ensure these fields are properly formatted
      name: updates.name?.trim().toUpperCase() ?? currentProduct.name,
      sku: updates.sku?.trim().toUpperCase() ?? currentProduct.sku,
      supplierCode: updates.supplierCode?.trim().toUpperCase() ?? currentProduct.supplierCode ?? '',
      purchasePackaging: updates.purchasePackaging?.trim().toUpperCase() ?? currentProduct.purchasePackaging,
      salePackaging: updates.salePackaging?.trim().toUpperCase() ?? currentProduct.salePackaging ?? '',
      // Ensure numeric fields are numbers
      price: typeof updates.price === 'number' ? Number(updates.price) : currentProduct.price,
      minPackageStock: typeof updates.minPackageStock === 'number' ? Number(updates.minPackageStock) : currentProduct.minPackageStock,
      desiredStock: typeof updates.desiredStock === 'number' ? Number(updates.desiredStock) : currentProduct.desiredStock,
      order: typeof updates.order === 'number' ? Number(updates.order) : currentProduct.order,
      // Preserve arrays and booleans
      tags: updates.tags ?? currentProduct.tags ?? [],
      isProduction: typeof updates.isProduction === 'boolean' ? updates.isProduction : currentProduct.isProduction
    };

    // Update the product
    await update(productRef, updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new DatabaseError('Failed to update product', { cause: error });
  }
}
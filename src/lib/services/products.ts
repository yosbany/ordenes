import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    const productRef = ref(db, `products/${id}`);
    await update(productRef, updates);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}
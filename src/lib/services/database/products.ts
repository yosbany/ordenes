import { ref, push, update, remove, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { DatabaseError } from '../errors';

export async function createProduct(data: Omit<Product, 'id'>): Promise<string> {
  try {
    const productsRef = ref(db, 'products');
    const newProductRef = await push(productsRef, data);
    
    if (!newProductRef.key) {
      throw new DatabaseError('Failed to generate product ID');
    }

    return newProductRef.key;
  } catch (error) {
    throw new DatabaseError('Failed to create product', { cause: error });
  }
}

export async function updateProductById(id: string, data: Partial<Product>): Promise<void> {
  try {
    const productRef = ref(db, `products/${id}`);
    
    // Verify product exists
    const snapshot = await get(productRef);
    if (!snapshot.exists()) {
      throw new DatabaseError('Product not found');
    }

    await update(productRef, data);
  } catch (error) {
    throw new DatabaseError('Failed to update product', { cause: error });
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productRef = ref(db, `products/${id}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id,
      ...snapshot.val()
    } as Product;
  } catch (error) {
    throw new DatabaseError('Failed to get product', { cause: error });
  }
}

export async function deleteProductById(id: string): Promise<void> {
  try {
    const productRef = ref(db, `products/${id}`);
    await remove(productRef);
  } catch (error) {
    throw new DatabaseError('Failed to delete product', { cause: error });
  }
}
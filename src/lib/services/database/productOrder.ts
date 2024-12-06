import { ref, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { DatabaseError } from '../errors';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/order/utils';

export async function updateProductOrder(productId: string, newOrder: number): Promise<void> {
  try {
    // Get all products to handle reordering
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    if (!snapshot.exists()) {
      throw new DatabaseError('No products found');
    }

    const products = Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<Product, 'id'>)
    }));

    // Get the product being moved
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new DatabaseError('Product not found');
    }

    const currentSector = getSectorFromOrder(product.order);
    const newSector = getSectorFromOrder(newOrder);
    const newSequence = getSequenceFromOrder(newOrder);

    // Get all products in the target sector
    const sectorProducts = products
      .filter(p => getSectorFromOrder(p.order) === newSector)
      .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

    // Calculate updates for all affected products
    const updates: Record<string, number> = {};

    if (currentSector === newSector) {
      // Moving within the same sector
      const currentSequence = getSequenceFromOrder(product.order);
      
      sectorProducts.forEach(p => {
        if (p.id === productId) return;

        let newSeq = getSequenceFromOrder(p.order);
        if (currentSequence < newSequence) {
          // Moving forward
          if (newSeq > currentSequence && newSeq <= newSequence) {
            newSeq--;
            updates[p.id] = calculateNewOrder(newSector, newSeq);
          }
        } else {
          // Moving backward
          if (newSeq >= newSequence && newSeq < currentSequence) {
            newSeq++;
            updates[p.id] = calculateNewOrder(newSector, newSeq);
          }
        }
      });
    } else {
      // Moving to a different sector
      // Shift all products in target sector from the insertion point
      sectorProducts.forEach(p => {
        const seq = getSequenceFromOrder(p.order);
        if (seq >= newSequence) {
          updates[p.id] = calculateNewOrder(newSector, seq + 1);
        }
      });
    }

    // Add the update for the moved product
    updates[productId] = newOrder;

    // Create the multi-path update
    const dbUpdates = Object.entries(updates).reduce((acc, [id, order]) => ({
      ...acc,
      [`products/${id}/order`]: order
    }), {});

    // Perform the update
    await update(ref(db), dbUpdates);
  } catch (error) {
    throw new DatabaseError('Failed to update product order', { cause: error });
  }
}
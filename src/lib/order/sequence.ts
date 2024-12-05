import { Product } from '@/types';
import { 
  getSectorFromOrder, 
  getSequenceFromOrder, 
  calculateNewOrder 
} from './utils';

export function maintainSequence(products: Product[], sectorCode: string): Product[] {
  // Get products in the sector and sort by current sequence
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Reassign sequences to maintain continuity
  let sequence = 1;
  const updatedProducts = products.map(product => {
    if (getSectorFromOrder(product.order) === sectorCode) {
      const newOrder = calculateNewOrder(sectorCode, sequence);
      sequence++;
      return { ...product, order: newOrder };
    }
    return product;
  });

  return updatedProducts;
}

export function validateSequence(products: Product[], sectorCode: string): boolean {
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  if (sectorProducts.length === 0) return true;

  // Check for duplicate orders
  const orders = sectorProducts.map(p => p.order);
  if (new Set(orders).size !== orders.length) {
    return false;
  }

  // Check for sequence continuity
  let expectedSequence = 1;
  for (const product of sectorProducts) {
    if (getSequenceFromOrder(product.order) !== expectedSequence) {
      return false;
    }
    expectedSequence++;
  }

  return true;
}
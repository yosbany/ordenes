import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder } from './utils';
import { SECTORS } from '@/config/constants';

export function validateOrder(order: number, products: Product[], currentProductId?: string): string | null {
  const sector = getSectorFromOrder(order);
  const sequence = getSequenceFromOrder(order);
  
  // Validate sector
  if (!SECTORS.find(s => s.code === sector)) {
    return 'Sector inválido';
  }

  // Validate sequence
  if (sequence < 1 || sequence > 999) {
    return 'Secuencia inválida';
  }

  // Check for duplicates (excluding current product)
  const duplicateProduct = products.find(p => 
    p.id !== currentProductId && 
    p.order === order
  );

  if (duplicateProduct) {
    return 'Ya existe un producto con este orden';
  }

  return null;
}

export function validateSequence(products: Product[], sectorCode: string): boolean {
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  if (sectorProducts.length === 0) return true;

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
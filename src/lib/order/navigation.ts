import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from './utils';

export function findAdjacentProducts(
  products: Product[],
  currentProduct: Product
): { prevProduct: Product | null; nextProduct: Product | null } {
  if (!products || !currentProduct) return { prevProduct: null, nextProduct: null };

  const currentSector = getSectorFromOrder(currentProduct.order);
  
  // Get all products in the same sector
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  const currentIndex = sectorProducts.findIndex(p => p.id === currentProduct.id);
  if (currentIndex === -1) return { prevProduct: null, nextProduct: null };

  return {
    prevProduct: currentIndex > 0 ? sectorProducts[currentIndex - 1] : null,
    nextProduct: currentIndex < sectorProducts.length - 1 ? sectorProducts[currentIndex + 1] : null
  };
}

export function getTargetPosition(
  direction: 'prev' | 'next',
  products: Product[],
  currentProduct: Product
): number | null {
  if (!products || !currentProduct) return null;

  const currentSector = getSectorFromOrder(currentProduct.order);
  const currentSequence = getSequenceFromOrder(currentProduct.order);

  // Get all products in the sector
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Calculate target sequence
  const targetSequence = direction === 'prev' 
    ? Math.max(1, currentSequence - 1)
    : Math.min(sectorProducts.length, currentSequence + 1);

  // Validate target sequence
  if (targetSequence === currentSequence) {
    return null;
  }

  return calculateNewOrder(currentSector, targetSequence);
}

export function canNavigate(
  direction: 'prev' | 'next',
  products: Product[],
  currentProduct: Product
): boolean {
  if (!products || !currentProduct) return false;

  const currentSector = getSectorFromOrder(currentProduct.order);
  const currentSequence = getSequenceFromOrder(currentProduct.order);

  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  if (direction === 'prev') {
    return currentSequence > 1;
  } else {
    return currentSequence < sectorProducts.length;
  }
}

export function validateNavigationTarget(
  targetOrder: number,
  products: Product[],
  currentProduct: Product
): boolean {
  const targetSector = getSectorFromOrder(targetOrder);
  const targetSequence = getSequenceFromOrder(targetOrder);
  const currentSector = getSectorFromOrder(currentProduct.order);

  // Must stay in same sector
  if (targetSector !== currentSector) return false;

  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Validate sequence range
  return targetSequence >= 1 && targetSequence <= sectorProducts.length;
}
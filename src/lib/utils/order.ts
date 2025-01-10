import { Product } from '@/types';
import { SECTORS } from '@/config/constants';

/**
 * Gets the sector code from an order number
 */
export function getSectorFromOrder(order: number): string {
  const orderStr = order.toString().padStart(5, '0');
  const sectorIndex = parseInt(orderStr.slice(0, 2)) - 1;
  return sectorIndex >= 0 && sectorIndex < SECTORS.length ? SECTORS[sectorIndex].code : SECTORS[0].code;
}

/**
 * Gets the sequence number from an order number
 */
export function getSequenceFromOrder(order: number): number {
  const orderStr = order.toString().padStart(5, '0');
  return parseInt(orderStr.slice(2));
}

/**
 * Calculates a new order number from sector and sequence
 */
export function calculateNewOrder(sectorCode: string, sequence: number): number {
  const sectorIndex = SECTORS.findIndex(s => s.code === sectorCode) + 1;
  return parseInt(`${sectorIndex.toString().padStart(2, '0')}${sequence.toString().padStart(3, '0')}`);
}

/**
 * Formats an order number for display
 */
export function formatOrderNumber(order: number): string {
  const sector = getSectorFromOrder(order);
  const sequence = getSequenceFromOrder(order);
  return `${sector}-${sequence.toString().padStart(3, '0')}`;
}

/**
 * Gets products for a specific sector, sorted by sequence
 */
export function getSectorProducts(products: Product[], sectorCode: string): Product[] {
  return products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));
}

/**
 * Gets the next available order number for a sector
 */
export function getNextAvailableOrder(products: Product[], sectorCode: string): number {
  const sectorProducts = getSectorProducts(products, sectorCode);
  const maxSequence = sectorProducts.length;
  return calculateNewOrder(sectorCode, maxSequence + 1);
}
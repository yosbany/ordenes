import { Product } from '@/types';
import { SECTORS } from '@/config/constants';

export function getSectorProducts(products: Product[], sectorCode: string): Product[] {
  return products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));
}

export function getSectorFromOrder(order: number): string {
  const orderStr = order.toString().padStart(5, '0');
  const sectorIndex = parseInt(orderStr.slice(0, 2)) - 1;
  return sectorIndex >= 0 && sectorIndex < SECTORS.length ? SECTORS[sectorIndex].code : SECTORS[0].code;
}

export function getSequenceFromOrder(order: number): number {
  const orderStr = order.toString().padStart(5, '0');
  return parseInt(orderStr.slice(2));
}

export function formatOrderNumber(order: number): string {
  const sector = getSectorFromOrder(order);
  const sequence = getSequenceFromOrder(order);
  return `${sector}-${sequence.toString().padStart(3, '0')}`;
}

export function calculateNewOrder(sectorCode: string, sequence: number): number {
  const sectorIndex = SECTORS.findIndex(s => s.code === sectorCode) + 1;
  return parseInt(`${sectorIndex.toString().padStart(2, '0')}${sequence.toString().padStart(3, '0')}`);
}

export function reorderProduct(
  currentProduct: Product,
  products: Product[],
  direction: 'prev' | 'next'
): { updatedProducts: Product[]; newOrder: number } {
  const currentSector = getSectorFromOrder(currentProduct.order);
  const sectorProducts = getSectorProducts(products, currentSector);
  const currentIndex = sectorProducts.findIndex(p => p.id === currentProduct.id);

  // Find target product
  const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sectorProducts.length) {
    throw new Error('No hay más productos en esa dirección');
  }

  const targetProduct = sectorProducts[targetIndex];
  const newOrder = targetProduct.order;
  const currentOrder = currentProduct.order;

  // Update orders
  const updatedProducts = products.map(product => {
    if (product.id === currentProduct.id) {
      return { ...product, order: newOrder };
    }
    if (product.id === targetProduct.id) {
      return { ...product, order: currentOrder };
    }
    return product;
  });

  return {
    updatedProducts,
    newOrder
  };
}

export function validateOrder(order: number, products: Product[]): boolean {
  const sector = getSectorFromOrder(order);
  const sequence = getSequenceFromOrder(order);
  
  // Validate sector exists
  if (!SECTORS.find(s => s.code === sector)) {
    return false;
  }

  // Validate sequence range
  if (sequence < 1 || sequence > 999) {
    return false;
  }

  // Check for duplicates
  const sectorProducts = getSectorProducts(products, sector);
  const isDuplicate = sectorProducts.some(p => 
    p.order === order && p.id !== products.find(prod => prod.order === order)?.id
  );

  return !isDuplicate;
}

export function getNextAvailableOrder(products: Product[], sectorCode: string): number {
  const sectorProducts = getSectorProducts(products, sectorCode);
  const maxSequence = sectorProducts.reduce((max, p) => {
    const sequence = getSequenceFromOrder(p.order);
    return sequence > max ? sequence : max;
  }, 0);
  
  return calculateNewOrder(sectorCode, maxSequence + 1);
}
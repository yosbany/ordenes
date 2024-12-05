import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder, getSectorProducts } from './utils';

export function swapProducts(products: Product[], productId1: string, productId2: string): Product[] {
  const product1 = products.find(p => p.id === productId1);
  const product2 = products.find(p => p.id === productId2);

  if (!product1 || !product2) {
    throw new Error('Productos no encontrados');
  }

  const sector1 = getSectorFromOrder(product1.order);
  const sector2 = getSectorFromOrder(product2.order);

  if (sector1 !== sector2) {
    throw new Error('No se pueden intercambiar productos de diferentes sectores');
  }

  return products.map(product => {
    if (product.id === productId1) {
      return { ...product, order: product2.order };
    }
    if (product.id === productId2) {
      return { ...product, order: product1.order };
    }
    return product;
  });
}

export function reorderProducts(
  products: Product[],
  sectorCode: string,
  targetPosition: number,
  movedProductId: string
): Product[] {
  const sectorProducts = getSectorProducts(products, sectorCode);
  let sequence = 1;
  
  return products.map(product => {
    if (getSectorFromOrder(product.order) !== sectorCode) {
      return product;
    }

    if (product.id === movedProductId) {
      return { ...product, order: calculateNewOrder(sectorCode, targetPosition) };
    }

    if (sequence === targetPosition) {
      sequence++;
    }

    const newOrder = calculateNewOrder(sectorCode, sequence);
    sequence++;
    return { ...product, order: newOrder };
  });
}
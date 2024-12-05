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

  // Intercambiar órdenes
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

export function moveProduct(products: Product[], productId: string, direction: 'prev' | 'next'): Product[] {
  const currentProduct = products.find(p => p.id === productId);
  if (!currentProduct) return products;

  const currentSector = getSectorFromOrder(currentProduct.order);
  const sectorProducts = getSectorProducts(products, currentSector);
  const currentIndex = sectorProducts.findIndex(p => p.id === productId);
  
  const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sectorProducts.length) {
    return products;
  }

  const targetProduct = sectorProducts[targetIndex];
  return swapProducts(products, currentProduct.id!, targetProduct.id!);
}
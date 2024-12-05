import { Product } from '@/types';
import { SECTORS } from '@/config/constants';

// Obtener sector y secuencia de un orden
export function getSectorFromOrder(order: number): string {
  const orderStr = order.toString().padStart(5, '0');
  const sectorIndex = parseInt(orderStr.slice(0, 2)) - 1;
  return sectorIndex >= 0 && sectorIndex < SECTORS.length ? SECTORS[sectorIndex].code : SECTORS[0].code;
}

export function getSequenceFromOrder(order: number): number {
  const orderStr = order.toString().padStart(5, '0');
  return parseInt(orderStr.slice(2));
}

// Crear un nuevo orden
export function createOrder(sectorCode: string, sequence: number): number {
  const sectorIndex = SECTORS.findIndex(s => s.code === sectorCode) + 1;
  return parseInt(`${sectorIndex.toString().padStart(2, '0')}${sequence.toString().padStart(3, '0')}`);
}

// Obtener productos de un sector ordenados por secuencia
export function getSectorProducts(products: Product[], sectorCode: string): Product[] {
  return products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));
}

// Intercambiar orden entre dos productos
export function swapOrders(products: Product[], productId1: string, productId2: string): Product[] {
  const product1 = products.find(p => p.id === productId1);
  const product2 = products.find(p => p.id === productId2);

  if (!product1 || !product2) {
    return products;
  }

  // Verificar que ambos productos están en el mismo sector
  if (getSectorFromOrder(product1.order) !== getSectorFromOrder(product2.order)) {
    return products;
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

// Validar un orden
export function validateOrder(order: number, products: Product[], currentProductId?: string): string | null {
  const sector = getSectorFromOrder(order);
  const sequence = getSequenceFromOrder(order);
  
  // Validar sector
  if (!SECTORS.find(s => s.code === sector)) {
    return 'Sector inválido';
  }

  // Validar secuencia
  if (sequence < 1 || sequence > 999) {
    return 'Secuencia inválida';
  }

  // Verificar duplicados (excluyendo el producto actual)
  const duplicateProduct = products.find(p => 
    p.id !== currentProductId && 
    p.order === order
  );

  if (duplicateProduct) {
    return 'Ya existe un producto con este orden';
  }

  return null;
}
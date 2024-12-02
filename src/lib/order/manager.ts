import { Product } from '@/types';
import { 
  getSectorFromOrder, 
  getSequenceFromOrder, 
  calculateNewOrder 
} from './utils';

export function getAdjacentProducts(products: Product[], currentProduct: Product) {
  const currentSector = getSectorFromOrder(currentProduct.order);
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  const currentIndex = sectorProducts.findIndex(p => p.id === currentProduct.id);
  
  return {
    prevProduct: currentIndex > 0 ? sectorProducts[currentIndex - 1] : null,
    nextProduct: currentIndex < sectorProducts.length - 1 ? sectorProducts[currentIndex + 1] : null
  };
}

export function maintainOrderSequence(products: Product[], sectorCode: string): Product[] {
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sectorCode)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  let sequence = 1;
  return products.map(product => {
    if (getSectorFromOrder(product.order) === sectorCode) {
      const newOrder = calculateNewOrder(sectorCode, sequence);
      sequence++;
      return { ...product, order: newOrder };
    }
    return product;
  });
}

export function handleProductDelete(products: Product[], deletedProduct: Product): Product[] {
  const sector = getSectorFromOrder(deletedProduct.order);
  const remainingProducts = products.filter(p => p.id !== deletedProduct.id);
  return maintainOrderSequence(remainingProducts, sector);
}

export function handleProductUpdate(
  products: Product[],
  updatedProduct: Product,
  originalOrder: number
): Product[] {
  const newSector = getSectorFromOrder(updatedProduct.order);
  const oldSector = getSectorFromOrder(originalOrder);

  let result = products.map(p => 
    p.id === updatedProduct.id ? updatedProduct : p
  );

  if (newSector !== oldSector) {
    result = maintainOrderSequence(result, oldSector);
  }
  result = maintainOrderSequence(result, newSector);

  return result;
}

export function handleProductAdd(products: Product[], newProduct: Product): Product[] {
  const sector = getSectorFromOrder(newProduct.order);
  return maintainOrderSequence([...products, newProduct], sector);
}

export function swapProductOrders(
  products: Product[],
  product1: Product,
  product2: Product
): Product[] {
  const sector = getSectorFromOrder(product1.order);
  
  if (getSectorFromOrder(product2.order) !== sector) {
    throw new Error('Cannot swap products from different sectors');
  }

  const updatedProducts = products.map(p => {
    if (p.id === product1.id) {
      return { ...p, order: product2.order };
    }
    if (p.id === product2.id) {
      return { ...p, order: product1.order };
    }
    return p;
  });

  return maintainOrderSequence(updatedProducts, sector);
}

export function validateOrderConsistency(products: Product[], sector: string): boolean {
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  if (sectorProducts.length === 0) return true;

  let previousSequence = 0;
  for (const product of sectorProducts) {
    const sequence = getSequenceFromOrder(product.order);
    if (sequence !== previousSequence + 1) {
      return false;
    }
    previousSequence = sequence;
  }

  return true;
}

export function validateOrderSequence(products: Product[], sector: string): boolean {
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sector)
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
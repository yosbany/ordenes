import { Product } from '@/types';
import { SECTORS } from '@/config/constants';

export function getProductOrder(product: Product) {
  const orderStr = product.order.toString().padStart(5, '0');
  return {
    sector: SECTORS[parseInt(orderStr.slice(0, 2)) - 1].code,
    sequence: parseInt(orderStr.slice(2))
  };
}

export function calculateOrder(sectorCode: string, sequence: number): number {
  const sectorIndex = SECTORS.findIndex(s => s.code === sectorCode) + 1;
  return parseInt(`${sectorIndex.toString().padStart(2, '0')}${sequence.toString().padStart(3, '0')}`);
}

export function reorderProducts(products: Product[], sectorCode: string): Product[] {
  const sectorProducts = products
    .filter(p => getProductOrder(p).sector === sectorCode)
    .sort((a, b) => getProductOrder(a).sequence - getProductOrder(b).sequence);

  return products.map(product => {
    if (getProductOrder(product).sector !== sectorCode) return product;
    
    const index = sectorProducts.findIndex(p => p.id === product.id);
    return {
      ...product,
      order: calculateOrder(sectorCode, index + 1)
    };
  });
}

export function swapProductOrders(
  products: Product[],
  product1: Product,
  product2: Product
): Product[] {
  const sector1 = getProductOrder(product1).sector;
  const sector2 = getProductOrder(product2).sector;

  if (sector1 !== sector2) {
    throw new Error('Cannot swap products from different sectors');
  }

  const updatedProducts = products.map(p => {
    if (p.id === product1.id) return { ...p, order: product2.order };
    if (p.id === product2.id) return { ...p, order: product1.order };
    return p;
  });

  return reorderProducts(updatedProducts, sector1);
}
import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/utils';

export function reorderAfterDelete(products: Product[], deletedProduct: Product): Product[] {
  const deletedSector = getSectorFromOrder(deletedProduct.order);
  const deletedSequence = getSequenceFromOrder(deletedProduct.order);

  // Get remaining products in the same sector
  const sectorProducts = products
    .filter(p => 
      p.id !== deletedProduct.id && 
      getSectorFromOrder(p.order) === deletedSector
    )
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Reorder remaining products
  return products.map(product => {
    // Skip the deleted product and products from other sectors
    if (product.id === deletedProduct.id || getSectorFromOrder(product.order) !== deletedSector) {
      return product;
    }

    const currentSequence = getSequenceFromOrder(product.order);
    
    // If product comes after the deleted one, move it up one position
    if (currentSequence > deletedSequence) {
      return {
        ...product,
        order: calculateNewOrder(deletedSector, currentSequence - 1)
      };
    }

    return product;
  });
}
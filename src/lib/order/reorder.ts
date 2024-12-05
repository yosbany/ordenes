import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/utils';

export function reorderProducts(
  products: Product[],
  targetSector: string,
  targetPosition: number,
  movedProductId: string
): Product[] {
  const movedProduct = products.find(p => p.id === movedProductId);
  if (!movedProduct) return products;

  const sourceSector = getSectorFromOrder(movedProduct.order);
  const isChangingSector = sourceSector !== targetSector;

  if (isChangingSector) {
    // First, reorder source sector (decrement positions after the moved product)
    const sourceProducts = products
      .filter(p => getSectorFromOrder(p.order) === sourceSector && p.id !== movedProductId)
      .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

    const sourceSequence = getSequenceFromOrder(movedProduct.order);

    // Then, reorder target sector (increment positions from target position)
    const targetProducts = products
      .filter(p => getSectorFromOrder(p.order) === targetSector)
      .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

    return products.map(product => {
      // Handle moved product
      if (product.id === movedProductId) {
        return {
          ...product,
          order: calculateNewOrder(targetSector, targetPosition)
        };
      }

      const productSector = getSectorFromOrder(product.order);
      const sequence = getSequenceFromOrder(product.order);

      // Handle source sector products
      if (productSector === sourceSector && sequence > sourceSequence) {
        return {
          ...product,
          order: calculateNewOrder(sourceSector, sequence - 1)
        };
      }

      // Handle target sector products
      if (productSector === targetSector && sequence >= targetPosition) {
        return {
          ...product,
          order: calculateNewOrder(targetSector, sequence + 1)
        };
      }

      return product;
    });
  }

  // If staying in same sector, handle reordering within sector
  const currentPosition = getSequenceFromOrder(movedProduct.order);
  
  return products.map(product => {
    // If product is not in this sector, keep it unchanged
    if (getSectorFromOrder(product.order) !== targetSector) {
      return product;
    }

    // If this is the moved product
    if (product.id === movedProductId) {
      return {
        ...product,
        order: calculateNewOrder(targetSector, targetPosition)
      };
    }

    const sequence = getSequenceFromOrder(product.order);

    // Moving up (to a lower position)
    if (targetPosition < currentPosition) {
      if (sequence >= targetPosition && sequence < currentPosition) {
        return {
          ...product,
          order: calculateNewOrder(targetSector, sequence + 1)
        };
      }
    }
    // Moving down (to a higher position)
    else if (targetPosition > currentPosition) {
      if (sequence <= targetPosition && sequence > currentPosition) {
        return {
          ...product,
          order: calculateNewOrder(targetSector, sequence - 1)
        };
      }
    }

    return product;
  });
}
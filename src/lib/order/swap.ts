import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/utils';

export function swapProductPositions(
  products: Product[],
  sourceProductId: string,
  targetPosition: number
): Product[] {
  const sourceProduct = products.find(p => p.id === sourceProductId);
  if (!sourceProduct) {
    throw new Error('Source product not found');
  }

  const sourceSector = getSectorFromOrder(sourceProduct.order);
  const targetSector = getSectorFromOrder(targetPosition);
  
  // Validar que ambas posiciones están en el mismo sector
  if (sourceSector !== targetSector) {
    throw new Error('Cannot swap products between different sectors');
  }

  const sourceSequence = getSequenceFromOrder(sourceProduct.order);
  const targetSequence = getSequenceFromOrder(targetPosition);

  // Si las posiciones son iguales, no hay cambios necesarios
  if (sourceSequence === targetSequence) {
    return products;
  }

  // Obtener productos del sector ordenados por secuencia
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === sourceSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Calcular el rango de productos afectados
  const start = Math.min(sourceSequence, targetSequence);
  const end = Math.max(sourceSequence, targetSequence);
  const isMovingUp = targetSequence < sourceSequence;

  // Crear nuevo array con las posiciones actualizadas
  return products.map(product => {
    const currentSector = getSectorFromOrder(product.order);
    const currentSequence = getSequenceFromOrder(product.order);

    // Si el producto no está en el sector afectado, mantenerlo igual
    if (currentSector !== sourceSector) {
      return product;
    }

    // Si es el producto que estamos moviendo
    if (product.id === sourceProductId) {
      return {
        ...product,
        order: calculateNewOrder(sourceSector, targetSequence)
      };
    }

    // Si el producto está en el rango afectado
    if (currentSequence >= start && currentSequence <= end) {
      let newSequence = currentSequence;
      
      if (isMovingUp) {
        // Si movemos hacia arriba, desplazar productos hacia abajo
        if (currentSequence < sourceSequence) {
          newSequence = currentSequence + 1;
        }
      } else {
        // Si movemos hacia abajo, desplazar productos hacia arriba
        if (currentSequence > sourceSequence) {
          newSequence = currentSequence - 1;
        }
      }

      return {
        ...product,
        order: calculateNewOrder(sourceSector, newSequence)
      };
    }

    return product;
  });
}

export function validateSwap(
  products: Product[],
  sourceProductId: string,
  targetPosition: number
): string | null {
  const sourceProduct = products.find(p => p.id === sourceProductId);
  if (!sourceProduct) {
    return 'Producto no encontrado';
  }

  const sourceSector = getSectorFromOrder(sourceProduct.order);
  const targetSector = getSectorFromOrder(targetPosition);

  if (sourceSector !== targetSector) {
    return 'No se puede mover productos entre diferentes sectores';
  }

  const sectorProducts = products.filter(
    p => getSectorFromOrder(p.order) === sourceSector
  );

  const targetSequence = getSequenceFromOrder(targetPosition);
  if (targetSequence < 1 || targetSequence > sectorProducts.length) {
    return `La posición debe estar entre 1 y ${sectorProducts.length}`;
  }

  return null;
}
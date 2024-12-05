import { Order, Product } from '@/types';

export function validateOrder(
  order: Omit<Order, 'id'>, 
  products: Product[]
): string | null {
  try {
    // Validate required fields
    if (!order.providerId) {
      return 'El proveedor es requerido';
    }

    if (!order.items || order.items.length === 0) {
      return 'Debe agregar al menos un producto';
    }

    // Validate items
    const seenProducts = new Set<string>();
    for (const item of order.items) {
      if (!item.productId) {
        return 'Producto inválido';
      }

      if (seenProducts.has(item.productId)) {
        return 'No puede haber productos duplicados';
      }
      seenProducts.add(item.productId);

      if (item.quantity <= 0) {
        return 'La cantidad debe ser mayor a 0';
      }

      // Find product
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return `Producto no encontrado`;
      }

      // Validate price matches
      if (Math.abs(item.price - product.price) > 0.01) {
        return `El precio del producto ${product.name} no coincide`;
      }

      // Validate subtotal calculation
      const expectedSubtotal = Number((item.price * item.quantity).toFixed(2));
      if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
        return `El subtotal del producto ${product.name} no coincide`;
      }
    }

    // Validate total
    const calculatedTotal = Number(order.items.reduce((sum, item) => 
      sum + Number((item.price * item.quantity).toFixed(2)), 
      0
    ).toFixed(2));

    if (Math.abs(order.total - calculatedTotal) > 0.01) {
      return 'El total no coincide';
    }

    return null;
  } catch (error) {
    console.error('Error validating order:', error);
    return 'Error al validar la orden';
  }
}
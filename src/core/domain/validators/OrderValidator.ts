import { Order } from '../entities';

export class OrderValidator {
  static validate(order: Omit<Order, 'id'>): string | null {
    if (!order.providerId) {
      return 'Provider ID is required';
    }

    if (!order.items || order.items.length === 0) {
      return 'Order must have at least one item';
    }

    // Validate items
    const seenProducts = new Set<string>();
    for (const item of order.items) {
      if (!item.productId) {
        return 'Invalid product';
      }

      if (seenProducts.has(item.productId)) {
        return 'Duplicate products are not allowed';
      }
      seenProducts.add(item.productId);

      if (item.quantity <= 0) {
        return 'Quantity must be greater than 0';
      }

      if (item.price <= 0) {
        return 'Price must be greater than 0';
      }

      const expectedSubtotal = Number((item.price * item.quantity).toFixed(2));
      if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
        return 'Invalid subtotal calculation';
      }
    }

    // Validate total
    const calculatedTotal = Number(order.items.reduce((sum, item) => 
      sum + Number((item.price * item.quantity).toFixed(2)), 
      0
    ).toFixed(2));

    if (Math.abs(order.total - calculatedTotal) > 0.01) {
      return 'Invalid total calculation';
    }

    return null;
  }
}
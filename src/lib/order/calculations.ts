import { Order, Product } from '@/types';
import { getCurrentTimestamp } from '@/lib/dateUtils';

export function calculateOrderTotal(items: Order['items']): number {
  return Number(items.reduce((sum, item) => 
    sum + Number((item.price * item.quantity).toFixed(2)), 
    0
  ).toFixed(2));
}

export function createOrderItem(product: Product, quantity: number) {
  const price = Number(Number(product.price).toFixed(2));
  const subtotal = Number((price * quantity).toFixed(2));
  return {
    productId: product.id!,
    quantity: Number(quantity),
    price,
    subtotal
  };
}

export function createOrder(
  providerId: string, 
  selectedProducts: Map<string, number>, 
  products: Product[]
): Omit<Order, 'id'> {
  if (!providerId || !products || products.length === 0) {
    throw new Error('Invalid order data');
  }

  const items = Array.from(selectedProducts.entries())
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      return createOrderItem(product, quantity);
    })
    .sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      if (!productA || !productB) return 0;
      return productA.order - productB.order;
    });

  const total = calculateOrderTotal(items);

  return {
    providerId,
    date: getCurrentTimestamp(),
    status: 'pending',
    items,
    total
  };
}
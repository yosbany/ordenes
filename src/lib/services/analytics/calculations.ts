import { Order, Product } from '@/types';

export interface ProductStats {
  id: string;
  name: string;
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
  purchasePackaging: string;
}

export function calculateProductStats(orders: Order[], products: Product[]): ProductStats[] {
  // Create a map to store aggregated stats for each product
  const stats = new Map<string, {
    amount: number;
    quantity: number;
    orders: Set<string>;
    purchasePackaging: string;
  }>();

  // Process all orders
  orders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      const currentStats = stats.get(item.productId) || {
        amount: 0,
        quantity: 0,
        orders: new Set(),
        purchasePackaging: product.purchasePackaging
      };
      
      // Calculate total amount (price × quantity)
      const amount = item.price * item.quantity;
      
      currentStats.amount += amount;
      currentStats.quantity += item.quantity;
      currentStats.orders.add(order.id!);
      
      stats.set(item.productId, currentStats);
    });
  });

  // Convert to array and add product details
  return Array.from(stats.entries())
    .map(([productId, productStats]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;

      return {
        id: productId,
        name: product.name,
        totalAmount: Number(productStats.amount.toFixed(2)),
        totalQuantity: productStats.quantity,
        orderCount: productStats.orders.size,
        purchasePackaging: productStats.purchasePackaging
      };
    })
    .filter((p): p is ProductStats => p !== null)
    .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total amount in descending order
}
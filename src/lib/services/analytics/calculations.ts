import { Order, Product } from '@/types';

export interface ProductStats {
  id: string;
  name: string;
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
  purchasePackaging: string;
}

export interface TagStats {
  tag: string;
  products: ProductStats[];
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
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
  for (const order of orders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

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
    }
  }

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
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function calculateTagStats(products: Product[], productStats: ProductStats[]): TagStats[] {
  // Create a map to store stats for each tag
  const tagStats = new Map<string, {
    products: Set<ProductStats>;
    totalAmount: number;
    totalQuantity: number;
    orderCount: number;
  }>();

  // Process each product with stats
  for (const stats of productStats) {
    const product = products.find(p => p.id === stats.id);
    if (!product?.tags?.length) continue;

    // Add stats to each tag
    for (const tag of product.tags) {
      const normalizedTag = tag.trim().toUpperCase();
      if (!normalizedTag) continue;

      const currentStats = tagStats.get(normalizedTag) || {
        products: new Set<ProductStats>(),
        totalAmount: 0,
        totalQuantity: 0,
        orderCount: 0
      };

      // Add the product stats to the tag
      currentStats.products.add(stats);
      currentStats.totalAmount += stats.totalAmount;
      currentStats.totalQuantity += stats.totalQuantity;
      currentStats.orderCount += stats.orderCount;

      tagStats.set(normalizedTag, currentStats);
    }
  }

  // Convert to array and sort by total amount
  return Array.from(tagStats.entries())
    .map(([tag, stats]) => ({
      tag,
      products: Array.from(stats.products).sort((a, b) => b.totalAmount - a.totalAmount),
      totalAmount: Number(stats.totalAmount.toFixed(2)),
      totalQuantity: stats.totalQuantity,
      orderCount: stats.orderCount
    }))
    .filter(tag => tag.products.length > 0) // Only include tags with products
    .sort((a, b) => b.totalAmount - a.totalAmount);
}
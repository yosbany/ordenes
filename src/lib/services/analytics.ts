import { Order, Product, Provider } from '@/types';
import { getCollection } from './database';

export interface WeeklyOrdersCount {
  date: string;
  count: number;
}

export interface ProductStats {
  id: string;
  name: string;
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
}

function calculateProductStats(orders: Order[], products: Product[]): ProductStats[] {
  const stats = new Map<string, {
    amount: number;
    quantity: number;
    orders: Set<string>;
  }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const currentStats = stats.get(item.productId) || {
        amount: 0,
        quantity: 0,
        orders: new Set()
      };
      
      const amount = item.price * item.quantity;
      
      currentStats.amount += amount;
      currentStats.quantity += item.quantity;
      currentStats.orders.add(order.id!);
      
      stats.set(item.productId, currentStats);
    });
  });

  return Array.from(stats.entries())
    .map(([productId, productStats]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;

      return {
        id: productId,
        name: product.name,
        totalAmount: productStats.amount,
        totalQuantity: productStats.quantity,
        orderCount: productStats.orders.size
      };
    })
    .filter((p): p is ProductStats => p !== null)
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function getAnalytics() {
  try {
    const [orders, products, providers] = await Promise.all([
      getCollection<Order>('orders'),
      getCollection<Product>('products'),
      getCollection<Provider>('providers')
    ]);

    if (!orders || !products || !providers) {
      throw new Error('Failed to fetch data');
    }

    // Calculate weekly orders
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyOrders = orders
      .filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= lastWeek && orderDate <= today;
      })
      .reduce((acc, order) => {
        const date = new Date(order.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const weeklyOrdersCount = Object.entries(weeklyOrders)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Calculate product statistics
    const productStats = calculateProductStats(orders, products);

    return {
      weeklyOrders: weeklyOrdersCount,
      topProducts: productStats.slice(0, 10),
      totalProducts: products.length,
      totalProviders: providers.length
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      weeklyOrders: [],
      topProducts: [],
      totalProducts: 0,
      totalProviders: 0
    };
  }
}
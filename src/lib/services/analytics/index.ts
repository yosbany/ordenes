import { Order, Product, Provider } from '@/types';
import { getCollection } from '../database';
import { calculateProductStats, calculateTagStats, ProductStats, TagStats } from './calculations';
import { calculateWeeklyOrders, WeeklyOrdersCount } from './orders';

export interface AnalyticsData {
  weeklyOrders: WeeklyOrdersCount[];
  topProducts: ProductStats[];
  topProductsByTags: TagStats[];
  totalProducts: number;
  totalProviders: number;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const [orders, products, providers] = await Promise.all([
      getCollection<Order>('orders'),
      getCollection<Product>('products'),
      getCollection<Provider>('providers')
    ]);

    if (!orders || !products || !providers) {
      throw new Error('Failed to fetch analytics data');
    }

    const weeklyOrders = calculateWeeklyOrders(orders);
    const productStats = calculateProductStats(orders, products);
    const tagStats = calculateTagStats(products, productStats);

    return {
      weeklyOrders,
      topProducts: productStats.slice(0, 10),
      topProductsByTags: tagStats.slice(0, 10),
      totalProducts: products.length,
      totalProviders: providers.length
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      weeklyOrders: [],
      topProducts: [],
      topProductsByTags: [],
      totalProducts: 0,
      totalProviders: 0
    };
  }
}

export type { WeeklyOrdersCount, ProductStats, TagStats };
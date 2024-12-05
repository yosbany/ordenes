import { Order, Product, Provider } from '@/types';
import { getCollection } from './database';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const PROVIDERS_COLLECTION = 'providers';

export interface WeeklyOrdersCount {
  date: string;
  count: number;
}

export interface TopProduct {
  id: string;
  name: string;
  totalQuantity: number;
  orderCount: number;
}

export interface ProductFrequency {
  id: string;
  name: string;
  frequency: number;
}

export async function getWeeklyOrdersCount(): Promise<WeeklyOrdersCount[]> {
  try {
    const orders = await getCollection<Order>(ORDERS_COLLECTION);
    if (!orders || orders.length === 0) {
      console.warn('No se encontraron órdenes en la última semana');
      return [];
    }

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= lastWeek && orderDate <= today;
    });

    const countByDate = weeklyOrders.reduce((acc, order) => {
      const date = new Date(order.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error: unknown) {
    console.error(
      'Error al obtener el conteo semanal de órdenes:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export async function getTopProducts(): Promise<TopProduct[]> {
  try {
    const [orders, products] = await Promise.all([
      getCollection<Order>(ORDERS_COLLECTION),
      getCollection<Product>(PRODUCTS_COLLECTION)
    ]);

    if (!orders || orders.length === 0) {
      console.warn('No se encontraron órdenes');
      return [];
    }

    if (!products || products.length === 0) {
      console.warn('No se encontraron productos');
      return [];
    }

    const productStats = new Map<string, { quantity: number; orders: Set<string> }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const stats = productStats.get(item.productId) || { quantity: 0, orders: new Set() };
        stats.quantity += item.quantity;
        stats.orders.add(order.id!);
        productStats.set(item.productId, stats);
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.warn(`Producto no encontrado para el ID: ${productId}`);
          return null;
        }

        return {
          id: productId,
          name: product.name,
          totalQuantity: stats.quantity,
          orderCount: stats.orders.size
        };
      })
      .filter((p): p is TopProduct => p !== null)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    return topProducts;
  } catch (error: unknown) {
    console.error(
      'Error al obtener los productos más vendidos:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export async function getProductFrequency(): Promise<ProductFrequency[]> {
  try {
    const [orders, products] = await Promise.all([
      getCollection<Order>(ORDERS_COLLECTION),
      getCollection<Product>(PRODUCTS_COLLECTION)
    ]);

    if (!orders || orders.length === 0) {
      console.warn('No se encontraron órdenes');
      return [];
    }

    if (!products || products.length === 0) {
      console.warn('No se encontraron productos');
      return [];
    }

    const frequencyMap = new Map<string, number>();

    orders.forEach(order => {
      const productIds = new Set(order.items.map(item => item.productId));
      productIds.forEach(id => {
        frequencyMap.set(id, (frequencyMap.get(id) || 0) + 1);
      });
    });

    const frequencies = Array.from(frequencyMap.entries())
      .map(([productId, frequency]) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.warn(`Producto no encontrado para el ID: ${productId}`);
          return null;
        }

        return {
          id: productId,
          name: product.name,
          frequency
        };
      })
      .filter((p): p is ProductFrequency => p !== null)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return frequencies;
  } catch (error: unknown) {
    console.error(
      'Error al obtener la frecuencia de productos:',
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export async function getTotalProducts(): Promise<number> {
  try {
    const products = await getCollection<Product>(PRODUCTS_COLLECTION);
    return products?.length || 0;
  } catch (error) {
    console.error('Error getting total products:', error);
    return 0;
  }
}

export async function getTotalProviders(): Promise<number> {
  try {
    const providers = await getCollection<Provider>(PROVIDERS_COLLECTION);
    return providers?.length || 0;
  } catch (error) {
    console.error('Error getting total providers:', error);
    return 0;
  }
}
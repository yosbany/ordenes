import { Order, Product, Provider } from '@/core/domain/entities';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { ILogger } from '@/core/domain/logging/ILogger';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface OrderStats {
  total: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: {
    pending: number;
    completed: number;
  };
}

export interface ProductStats {
  id: string;
  name: string;
  totalQuantity: number;
  totalAmount: number;
  orderCount: number;
  averageQuantityPerOrder: number;
  lastOrderDate: number | null;
}

export interface ProviderStats {
  id: string;
  name: string;
  totalOrders: number;
  totalAmount: number;
  averageOrderAmount: number;
  lastOrderDate: number | null;
}

export interface DashboardStats {
  orders: {
    today: OrderStats;
    week: OrderStats;
    month: OrderStats;
  };
  topProducts: ProductStats[];
  topProviders: ProviderStats[];
  totals: {
    products: number;
    providers: number;
    orders: number;
  };
}

export class AnalyticsService {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private providerRepository: IProviderRepository,
    private logger: ILogger
  ) {}

  private calculateOrderStats(orders: Order[]): OrderStats {
    const total = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      totalAmount,
      averageAmount: total > 0 ? totalAmount / total : 0,
      byStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length
      }
    };
  }

  private calculateProductStats(
    orders: Order[],
    products: Map<string, Product>
  ): ProductStats[] {
    const stats = new Map<string, {
      name: string;
      totalQuantity: number;
      totalAmount: number;
      orderCount: number;
      lastOrderDate: number | null;
    }>();

    // Procesar cada orden
    for (const order of orders) {
      for (const item of order.items) {
        const product = products.get(item.productId);
        if (!product) continue;

        const current = stats.get(item.productId) || {
          name: product.name,
          totalQuantity: 0,
          totalAmount: 0,
          orderCount: 0,
          lastOrderDate: null
        };

        current.totalQuantity += item.quantity;
        current.totalAmount += item.subtotal;
        current.orderCount++;
        current.lastOrderDate = Math.max(
          order.date,
          current.lastOrderDate || 0
        );

        stats.set(item.productId, current);
      }
    }

    return Array.from(stats.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        totalQuantity: data.totalQuantity,
        totalAmount: data.totalAmount,
        orderCount: data.orderCount,
        averageQuantityPerOrder: data.totalQuantity / data.orderCount,
        lastOrderDate: data.lastOrderDate
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  private calculateProviderStats(
    orders: Order[],
    providers: Map<string, Provider>
  ): ProviderStats[] {
    const stats = new Map<string, {
      totalOrders: number;
      totalAmount: number;
      lastOrderDate: number | null;
    }>();

    // Procesar cada orden
    for (const order of orders) {
      const provider = providers.get(order.providerId);
      if (!provider) continue;

      const current = stats.get(order.providerId) || {
        totalOrders: 0,
        totalAmount: 0,
        lastOrderDate: null
      };

      current.totalOrders++;
      current.totalAmount += order.total;
      current.lastOrderDate = Math.max(
        order.date,
        current.lastOrderDate || 0
      );

      stats.set(order.providerId, current);
    }

    return Array.from(stats.entries())
      .map(([id, data]) => {
        const provider = providers.get(id)!;
        return {
          id,
          name: provider.commercialName,
          totalOrders: data.totalOrders,
          totalAmount: data.totalAmount,
          averageOrderAmount: data.totalAmount / data.totalOrders,
          lastOrderDate: data.lastOrderDate
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      this.logger.debug('Fetching dashboard stats');

      // Obtener todos los datos necesarios
      const [orders, products, providers] = await Promise.all([
        this.orderRepository.getAll(),
        this.productRepository.getAll(),
        this.providerRepository.getAll()
      ]);

      // Crear mapas para búsqueda eficiente
      const productsMap = new Map(products.map(p => [p.id!, p]));
      const providersMap = new Map(providers.map(p => [p.id!, p]));

      // Calcular rangos de fechas
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Filtrar órdenes por período
      const todayOrders = orders.filter(o => {
        const date = new Date(o.date);
        return date >= startOfDay(now) && date <= endOfDay(now);
      });

      const weekOrders = orders.filter(o => {
        const date = new Date(o.date);
        return date >= weekStart && date <= weekEnd;
      });

      const monthOrders = orders.filter(o => {
        const date = new Date(o.date);
        return date >= monthStart && date <= monthEnd;
      });

      // Calcular estadísticas
      const stats: DashboardStats = {
        orders: {
          today: this.calculateOrderStats(todayOrders),
          week: this.calculateOrderStats(weekOrders),
          month: this.calculateOrderStats(monthOrders)
        },
        topProducts: this.calculateProductStats(orders, productsMap).slice(0, 10),
        topProviders: this.calculateProviderStats(orders, providersMap).slice(0, 5),
        totals: {
          products: products.length,
          providers: providers.length,
          orders: orders.length
        }
      };

      this.logger.debug('Dashboard stats calculated successfully', {
        todayOrders: stats.orders.today.total,
        weekOrders: stats.orders.week.total,
        monthOrders: stats.orders.month.total,
        topProducts: stats.topProducts.length,
        topProviders: stats.topProviders.length
      });

      return stats;

    } catch (error) {
      this.logger.error('Error calculating dashboard stats', error as Error);
      throw error;
    }
  }
}
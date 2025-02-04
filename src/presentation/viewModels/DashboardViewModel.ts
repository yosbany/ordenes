import { makeAutoObservable, runInAction } from 'mobx';
import { AnalyticsService } from '@/core/application/services/AnalyticsService';
import { ILogger } from '@/core/domain/logging/ILogger';
import { WeekDay } from '@/core/domain/entities';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { ProductStats, TagStats } from '@/lib/services/analytics';

export class DashboardViewModel {
  stats = {
    orders: {
      today: { total: 0, totalAmount: 0, averageAmount: 0, byStatus: { pending: 0, completed: 0 } },
      week: { total: 0, totalAmount: 0, averageAmount: 0, byStatus: { pending: 0, completed: 0 } },
      month: { total: 0, totalAmount: 0, averageAmount: 0, byStatus: { pending: 0, completed: 0 } }
    },
    topProducts: [] as ProductStats[],
    topProductsByTags: [] as TagStats[],
    totals: { products: 0, providers: 0, orders: 0 }
  };
  loading = true;
  error: string | null = null;
  lastUpdate: number | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private logger: ILogger
  ) {
    makeAutoObservable(this);
    this.loadStats(); // Load stats immediately on creation
  }

  async loadStats() {
    try {
      this.loading = true;
      this.error = null;
      this.logger.info('Loading dashboard stats');

      const stats = await this.analyticsService.getDashboardStats();

      runInAction(() => {
        this.stats = {
          orders: stats.orders || this.stats.orders,
          topProducts: stats.topProducts || [],
          topProductsByTags: stats.topProductsByTags || [],
          totals: stats.totals || this.stats.totals
        };
        this.lastUpdate = Date.now();
      });

      this.logger.debug('Dashboard stats loaded successfully', {
        todayOrders: stats.orders.today.total,
        weekOrders: stats.orders.week.total,
        monthOrders: stats.orders.month.total
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Error al cargar las estadísticas';
      });
      this.logger.error('Failed to load dashboard stats', error as Error);
      toast.error(this.error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Getters para estadísticas de órdenes
  get todayOrdersCount() {
    return this.stats.orders.today.total;
  }

  get todayOrdersAmount() {
    return this.stats.orders.today.totalAmount;
  }

  get weekOrdersCount() {
    return this.stats.orders.week.total;
  }

  get weekOrdersAmount() {
    return this.stats.orders.week.totalAmount;
  }

  get monthOrdersCount() {
    return this.stats.orders.month.total;
  }

  get monthOrdersAmount() {
    return this.stats.orders.month.totalAmount;
  }

  // Getters para estado de órdenes
  get pendingOrdersCount() {
    return this.stats.orders.today.byStatus.pending;
  }

  get completedOrdersCount() {
    return this.stats.orders.today.byStatus.completed;
  }

  // Getters para totales
  get totalProducts() {
    return this.stats.totals.products;
  }

  get totalProviders() {
    return this.stats.totals.providers;
  }

  get totalOrders() {
    return this.stats.totals.orders;
  }

  // Getters para productos y etiquetas destacados
  get topProducts() {
    return this.stats.topProducts || [];
  }

  get topProductsByTags() {
    return this.stats.topProductsByTags || [];
  }

  // Utilidades
  get currentDayName(): WeekDay {
    const dayName = format(new Date(), 'EEEE', { locale: es });
    const weekDayMap: Record<string, WeekDay> = {
      'lunes': 'monday',
      'martes': 'tuesday',
      'miércoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday'
    };
    return weekDayMap[dayName];
  }

  get formattedLastUpdate(): string | null {
    if (!this.lastUpdate) return null;
    return format(this.lastUpdate, "d 'de' MMMM, yyyy HH:mm", { locale: es });
  }

  get isStale(): boolean {
    if (!this.lastUpdate) return true;
    // Datos obsoletos después de 5 minutos
    return Date.now() - this.lastUpdate > 5 * 60 * 1000;
  }
}
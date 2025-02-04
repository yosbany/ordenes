import { makeAutoObservable, runInAction } from 'mobx';
import { AnalyticsService, DashboardStats } from '@/core/application/services/AnalyticsService';
import { ILogger } from '@/core/domain/logging/ILogger';
import { toast } from 'react-hot-toast';

export class AnalyticsViewModel {
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;
  lastUpdate: number | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private logger: ILogger
  ) {
    makeAutoObservable(this);
  }

  async loadStats() {
    try {
      this.loading = true;
      this.error = null;
      this.logger.info('Loading dashboard stats');

      const stats = await this.analyticsService.getDashboardStats();

      // Usar runInAction para actualizar múltiples observables
      runInAction(() => {
        this.stats = stats;
        this.lastUpdate = Date.now();
      });

      this.logger.debug('Dashboard stats loaded successfully', {
        topProductsCount: stats.topProducts.length,
        topProvidersCount: stats.topProviders.length,
        totals: stats.totals
      });
    } catch (error) {
      this.error = 'Error al cargar las estadísticas';
      this.logger.error('Failed to load dashboard stats', error as Error);
      toast.error(this.error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  get todayOrdersCount(): number {
    return this.stats?.orders.today.total || 0;
  }

  get todayOrdersAmount(): number {
    return this.stats?.orders.today.totalAmount || 0;
  }

  get weekOrdersCount(): number {
    return this.stats?.orders.week.total || 0;
  }

  get weekOrdersAmount(): number {
    return this.stats?.orders.week.totalAmount || 0;
  }

  get monthOrdersCount(): number {
    return this.stats?.orders.month.total || 0;
  }

  get monthOrdersAmount(): number {
    return this.stats?.orders.month.totalAmount || 0;
  }

  get pendingOrdersCount(): number {
    return this.stats?.orders.today.byStatus.pending || 0;
  }

  get completedOrdersCount(): number {
    return this.stats?.orders.today.byStatus.completed || 0;
  }

  get totalProducts(): number {
    return this.stats?.totals.products || 0;
  }

  get totalProviders(): number {
    return this.stats?.totals.providers || 0;
  }

  get totalOrders(): number {
    return this.stats?.totals.orders || 0;
  }

  get topProducts() {
    return this.stats?.topProducts || [];
  }

  get topProviders() {
    return this.stats?.topProviders || [];
  }

  get isStale(): boolean {
    if (!this.lastUpdate) return true;
    // Considerar los datos obsoletos después de 5 minutos
    return Date.now() - this.lastUpdate > 5 * 60 * 1000;
  }
}
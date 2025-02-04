import { DashboardViewModel } from '../DashboardViewModel';
import { AnalyticsService } from '@/core/application/services/AnalyticsService';
import { ILogger } from '@/core/domain/logging/ILogger';

// Mock del servicio de analíticas
const mockAnalyticsService = {
  getDashboardStats: jest.fn()
} as unknown as AnalyticsService;

// Mock del logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as ILogger;

describe('DashboardViewModel', () => {
  let viewModel: DashboardViewModel;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    viewModel = new DashboardViewModel(mockAnalyticsService, mockLogger);
  });

  afterEach(() => {
    viewModel.dispose();
    jest.useRealTimers();
  });

  const mockStats = {
    orders: {
      today: {
        total: 5,
        totalAmount: 1000,
        averageAmount: 200,
        byStatus: { pending: 2, completed: 3 }
      },
      week: {
        total: 20,
        totalAmount: 4000,
        averageAmount: 200,
        byStatus: { pending: 5, completed: 15 }
      },
      month: {
        total: 80,
        totalAmount: 16000,
        averageAmount: 200,
        byStatus: { pending: 10, completed: 70 }
      }
    },
    topProducts: [
      {
        id: 'product-1',
        name: 'Product 1',
        totalQuantity: 100,
        totalAmount: 5000,
        orderCount: 20,
        averageQuantityPerOrder: 5,
        lastOrderDate: Date.now()
      }
    ],
    topProviders: [
      {
        id: 'provider-1',
        name: 'Provider 1',
        totalOrders: 30,
        totalAmount: 10000,
        averageOrderAmount: 333.33,
        lastOrderDate: Date.now()
      }
    ],
    totals: {
      products: 100,
      providers: 20,
      orders: 500
    }
  };

  describe('loadStats', () => {
    it('should load stats successfully', async () => {
      mockAnalyticsService.getDashboardStats.mockResolvedValue(mockStats);

      await viewModel.loadStats();

      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBeNull();
      expect(viewModel.stats).toEqual(mockStats);
      expect(viewModel.lastUpdate).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('Loading dashboard stats');
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockAnalyticsService.getDashboardStats.mockRejectedValue(error);

      await viewModel.loadStats();

      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBe('Error al cargar las estadísticas');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load dashboard stats',
        error
      );
    });
  });

  describe('auto refresh', () => {
    it('should start auto refresh on creation', () => {
      expect(viewModel['refreshInterval']).not.toBeNull();
    });

    it('should refresh stats every 5 minutes', async () => {
      mockAnalyticsService.getDashboardStats.mockResolvedValue(mockStats);

      // Avanzar 5 minutos
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(mockAnalyticsService.getDashboardStats).toHaveBeenCalledTimes(1);

      // Avanzar otros 5 minutos
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(mockAnalyticsService.getDashboardStats).toHaveBeenCalledTimes(2);
    });

    it('should stop auto refresh on dispose', () => {
      viewModel.dispose();
      expect(viewModel['refreshInterval']).toBeNull();
    });
  });

  describe('computed properties', () => {
    beforeEach(async () => {
      mockAnalyticsService.getDashboardStats.mockResolvedValue(mockStats);
      await viewModel.loadStats();
    });

    it('should return correct order counts', () => {
      expect(viewModel.todayOrdersCount).toBe(5);
      expect(viewModel.weekOrdersCount).toBe(20);
      expect(viewModel.monthOrdersCount).toBe(80);
    });

    it('should return correct order amounts', () => {
      expect(viewModel.todayOrdersAmount).toBe(1000);
      expect(viewModel.weekOrdersAmount).toBe(4000);
      expect(viewModel.monthOrdersAmount).toBe(16000);
    });

    it('should return correct order status counts', () => {
      expect(viewModel.pendingOrdersCount).toBe(2);
      expect(viewModel.completedOrdersCount).toBe(3);
    });

    it('should return correct totals', () => {
      expect(viewModel.totalProducts).toBe(100);
      expect(viewModel.totalProviders).toBe(20);
      expect(viewModel.totalOrders).toBe(500);
    });

    it('should return top products and providers', () => {
      expect(viewModel.topProducts).toEqual(mockStats.topProducts);
      expect(viewModel.topProviders).toEqual(mockStats.topProviders);
    });
  });

  describe('utility methods', () => {
    it('should return current day name', () => {
      const dayName = viewModel.currentDayName;
      expect(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .toContain(dayName);
    });

    it('should format last update time', async () => {
      mockAnalyticsService.getDashboardStats.mockResolvedValue(mockStats);
      await viewModel.loadStats();

      expect(viewModel.formattedLastUpdate).toMatch(/\d+ de \w+, \d{4} \d{2}:\d{2}/);
    });

    it('should return null for formatted last update when no update exists', () => {
      expect(viewModel.formattedLastUpdate).toBeNull();
    });

    it('should detect stale data', async () => {
      mockAnalyticsService.getDashboardStats.mockResolvedValue(mockStats);
      await viewModel.loadStats();
      
      expect(viewModel.isStale).toBe(false);

      // Avanzar 6 minutos
      jest.advanceTimersByTime(6 * 60 * 1000);
      
      expect(viewModel.isStale).toBe(true);
    });
  });
});
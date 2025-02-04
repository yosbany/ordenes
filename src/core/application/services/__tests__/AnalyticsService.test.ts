import { AnalyticsService } from '../AnalyticsService';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { ILogger } from '@/core/domain/logging/ILogger';
import { Order, Product, Provider } from '@/core/domain/entities';

// Mocks de los repositorios
const mockOrderRepository = {
  getAll: jest.fn()
} as unknown as IOrderRepository;

const mockProductRepository = {
  getAll: jest.fn()
} as unknown as IProductRepository;

const mockProviderRepository = {
  getAll: jest.fn()
} as unknown as IProviderRepository;

// Mock del logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as ILogger;

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnalyticsService(
      mockOrderRepository,
      mockProductRepository,
      mockProviderRepository,
      mockLogger
    );
  });

  const mockOrders: Order[] = [
    {
      id: 'order-1',
      providerId: 'provider-1',
      date: Date.now(),
      status: 'completed',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          price: 10,
          subtotal: 20
        }
      ],
      total: 20
    }
  ];

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Test Product',
      sku: 'TEST-001',
      purchasePackaging: 'CAJA',
      salePackaging: 'UNIDAD',
      order: 10100,
      price: 10,
      desiredStock: 10,
      minPackageStock: 5,
      providerId: 'provider-1',
      tags: [],
      isProduction: false
    }
  ];

  const mockProviders: Provider[] = [
    {
      id: 'provider-1',
      commercialName: 'Test Provider',
      legalName: 'Test Legal Name',
      rut: '123456789012',
      phone: '93609319',
      deliveryDays: ['monday'],
      orderDays: ['monday']
    }
  ];

  describe('getDashboardStats', () => {
    beforeEach(() => {
      mockOrderRepository.getAll.mockResolvedValue(mockOrders);
      mockProductRepository.getAll.mockResolvedValue(mockProducts);
      mockProviderRepository.getAll.mockResolvedValue(mockProviders);
    });

    it('should calculate dashboard stats correctly', async () => {
      const stats = await service.getDashboardStats();

      expect(stats).toHaveProperty('orders');
      expect(stats).toHaveProperty('topProducts');
      expect(stats).toHaveProperty('topProviders');
      expect(stats).toHaveProperty('totals');

      expect(stats.totals).toEqual({
        products: 1,
        providers: 1,
        orders: 1
      });
    });

    it('should calculate order stats by period', async () => {
      const stats = await service.getDashboardStats();

      expect(stats.orders).toHaveProperty('today');
      expect(stats.orders).toHaveProperty('week');
      expect(stats.orders).toHaveProperty('month');

      expect(stats.orders.today).toHaveProperty('total');
      expect(stats.orders.today).toHaveProperty('totalAmount');
      expect(stats.orders.today).toHaveProperty('averageAmount');
      expect(stats.orders.today).toHaveProperty('byStatus');
    });

    it('should calculate top products correctly', async () => {
      const stats = await service.getDashboardStats();

      expect(stats.topProducts).toBeInstanceOf(Array);
      expect(stats.topProducts[0]).toHaveProperty('id');
      expect(stats.topProducts[0]).toHaveProperty('name');
      expect(stats.topProducts[0]).toHaveProperty('totalQuantity');
      expect(stats.topProducts[0]).toHaveProperty('totalAmount');
      expect(stats.topProducts[0]).toHaveProperty('orderCount');
      expect(stats.topProducts[0]).toHaveProperty('averageQuantityPerOrder');
      expect(stats.topProducts[0]).toHaveProperty('lastOrderDate');
    });

    it('should calculate top providers correctly', async () => {
      const stats = await service.getDashboardStats();

      expect(stats.topProviders).toBeInstanceOf(Array);
      expect(stats.topProviders[0]).toHaveProperty('id');
      expect(stats.topProviders[0]).toHaveProperty('name');
      expect(stats.topProviders[0]).toHaveProperty('totalOrders');
      expect(stats.topProviders[0]).toHaveProperty('totalAmount');
      expect(stats.topProviders[0]).toHaveProperty('averageOrderAmount');
      expect(stats.topProviders[0]).toHaveProperty('lastOrderDate');
    });

    it('should handle empty data', async () => {
      mockOrderRepository.getAll.mockResolvedValue([]);
      mockProductRepository.getAll.mockResolvedValue([]);
      mockProviderRepository.getAll.mockResolvedValue([]);

      const stats = await service.getDashboardStats();

      expect(stats.orders.today.total).toBe(0);
      expect(stats.orders.today.totalAmount).toBe(0);
      expect(stats.orders.today.averageAmount).toBe(0);
      expect(stats.topProducts).toHaveLength(0);
      expect(stats.topProviders).toHaveLength(0);
      expect(stats.totals.products).toBe(0);
      expect(stats.totals.providers).toBe(0);
      expect(stats.totals.orders).toBe(0);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockOrderRepository.getAll.mockRejectedValue(error);

      await expect(service.getDashboardStats()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error calculating dashboard stats',
        error
      );
    });
  });
});
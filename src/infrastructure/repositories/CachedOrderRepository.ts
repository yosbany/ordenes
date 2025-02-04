import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { ICache } from '@/core/domain/cache/ICache';
import { Order } from '@/core/domain/entities';
import { ILogger } from '@/core/domain/logging/ILogger';

export class CachedOrderRepository implements IOrderRepository {
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private repository: IOrderRepository,
    private cache: ICache,
    private logger: ILogger
  ) {}

  private getCacheKey(type: string, id?: string): string {
    return `orders:${type}${id ? `:${id}` : ''}`;
  }

  async getAll(): Promise<Order[]> {
    const cacheKey = this.getCacheKey('all');
    
    try {
      // Try cache first
      const cached = await this.cache.get<Order[]>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for all orders');
        return cached;
      }

      // Cache miss, get from repository
      this.logger.debug('Cache miss for all orders');
      const orders = await this.repository.getAll();
      
      // Cache the result
      await this.cache.set(cacheKey, orders, this.TTL);
      
      return orders;
    } catch (error) {
      this.logger.error('Error in cached getAll', error as Error);
      return this.repository.getAll();
    }
  }

  async getById(id: string): Promise<Order | null> {
    const cacheKey = this.getCacheKey('single', id);
    
    try {
      // Try cache first
      const cached = await this.cache.get<Order>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for order', { orderId: id });
        return cached;
      }

      // Cache miss, get from repository
      this.logger.debug('Cache miss for order', { orderId: id });
      const order = await this.repository.getById(id);
      
      // Cache the result if found
      if (order) {
        await this.cache.set(cacheKey, order, this.TTL);
      }
      
      return order;
    } catch (error) {
      this.logger.error('Error in cached getById', error as Error, { orderId: id });
      return this.repository.getById(id);
    }
  }

  async getByProvider(providerId: string): Promise<Order[]> {
    const cacheKey = this.getCacheKey('provider', providerId);
    
    try {
      // Try cache first
      const cached = await this.cache.get<Order[]>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for provider orders', { providerId });
        return cached;
      }

      // Cache miss, get from repository
      this.logger.debug('Cache miss for provider orders', { providerId });
      const orders = await this.repository.getByProvider(providerId);
      
      // Cache the result
      await this.cache.set(cacheKey, orders, this.TTL);
      
      return orders;
    } catch (error) {
      this.logger.error('Error in cached getByProvider', error as Error, { providerId });
      return this.repository.getByProvider(providerId);
    }
  }

  async create(order: Omit<Order, 'id'>): Promise<string> {
    try {
      const orderId = await this.repository.create(order);
      
      // Invalidate relevant caches
      await Promise.all([
        this.cache.delete(this.getCacheKey('all')),
        this.cache.delete(this.getCacheKey('provider', order.providerId))
      ]);
      
      this.logger.debug('Cache invalidated after create', { orderId });
      return orderId;
    } catch (error) {
      this.logger.error('Error in cached create', error as Error);
      throw error;
    }
  }

  async update(id: string, order: Partial<Order>): Promise<void> {
    try {
      await this.repository.update(id, order);
      
      // Invalidate relevant caches
      const fullOrder = await this.repository.getById(id);
      if (fullOrder) {
        await Promise.all([
          this.cache.delete(this.getCacheKey('all')),
          this.cache.delete(this.getCacheKey('single', id)),
          this.cache.delete(this.getCacheKey('provider', fullOrder.providerId))
        ]);
      }
      
      this.logger.debug('Cache invalidated after update', { orderId: id });
    } catch (error) {
      this.logger.error('Error in cached update', error as Error, { orderId: id });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Get the order before deleting to know which caches to invalidate
      const order = await this.repository.getById(id);
      await this.repository.delete(id);
      
      // Invalidate relevant caches
      if (order) {
        await Promise.all([
          this.cache.delete(this.getCacheKey('all')),
          this.cache.delete(this.getCacheKey('single', id)),
          this.cache.delete(this.getCacheKey('provider', order.providerId))
        ]);
      }
      
      this.logger.debug('Cache invalidated after delete', { orderId: id });
    } catch (error) {
      this.logger.error('Error in cached delete', error as Error, { orderId: id });
      throw error;
    }
  }

  subscribeToProviderOrders(
    providerId: string,
    callback: (orders: Order[]) => void
  ): () => void {
    // For real-time subscriptions, we'll bypass the cache
    return this.repository.subscribeToProviderOrders(providerId, callback);
  }
}
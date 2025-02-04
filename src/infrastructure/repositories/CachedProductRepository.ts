import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { ICache } from '@/core/domain/cache/ICache';
import { Product } from '@/core/domain/entities';
import { ILogger } from '@/core/domain/logging/ILogger';

export class CachedProductRepository implements IProductRepository {
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private repository: IProductRepository,
    private cache: ICache,
    private logger: ILogger
  ) {}

  private getCacheKey(type: string, id?: string): string {
    return `products:${type}${id ? `:${id}` : ''}`;
  }

  async getAll(): Promise<Product[]> {
    const cacheKey = this.getCacheKey('all');
    
    try {
      // Intentar obtener de caché primero
      const cached = await this.cache.get<Product[]>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for all products');
        return cached;
      }

      // Cache miss, obtener del repositorio
      this.logger.debug('Cache miss for all products');
      const products = await this.repository.getAll();
      
      // Guardar en caché
      await this.cache.set(cacheKey, products, this.TTL);
      
      return products;
    } catch (error) {
      this.logger.error('Error in cached getAll', error as Error);
      return this.repository.getAll();
    }
  }

  async getById(id: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey('single', id);
    
    try {
      // Intentar obtener de caché primero
      const cached = await this.cache.get<Product>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for product', { productId: id });
        return cached;
      }

      // Cache miss, obtener del repositorio
      this.logger.debug('Cache miss for product', { productId: id });
      const product = await this.repository.getById(id);
      
      // Guardar en caché si se encontró
      if (product) {
        await this.cache.set(cacheKey, product, this.TTL);
      }
      
      return product;
    } catch (error) {
      this.logger.error('Error in cached getById', error as Error, { productId: id });
      return this.repository.getById(id);
    }
  }

  async getByProvider(providerId: string): Promise<Product[]> {
    const cacheKey = this.getCacheKey('provider', providerId);
    
    try {
      // Intentar obtener de caché primero
      const cached = await this.cache.get<Product[]>(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit for provider products', { providerId });
        return cached;
      }

      // Cache miss, obtener del repositorio
      this.logger.debug('Cache miss for provider products', { providerId });
      const products = await this.repository.getByProvider(providerId);
      
      // Guardar en caché
      await this.cache.set(cacheKey, products, this.TTL);
      
      return products;
    } catch (error) {
      this.logger.error('Error in cached getByProvider', error as Error, { providerId });
      return this.repository.getByProvider(providerId);
    }
  }

  async create(product: Omit<Product, 'id'>): Promise<string> {
    try {
      const productId = await this.repository.create(product);
      
      // Invalidar cachés relevantes
      await Promise.all([
        this.cache.delete(this.getCacheKey('all')),
        this.cache.delete(this.getCacheKey('provider', product.providerId))
      ]);
      
      this.logger.debug('Cache invalidated after create', { productId });
      return productId;
    } catch (error) {
      this.logger.error('Error in cached create', error as Error);
      throw error;
    }
  }

  async update(id: string, product: Partial<Product>): Promise<void> {
    try {
      await this.repository.update(id, product);
      
      // Invalidar cachés relevantes
      const fullProduct = await this.repository.getById(id);
      if (fullProduct) {
        await Promise.all([
          this.cache.delete(this.getCacheKey('all')),
          this.cache.delete(this.getCacheKey('single', id)),
          this.cache.delete(this.getCacheKey('provider', fullProduct.providerId))
        ]);
      }
      
      this.logger.debug('Cache invalidated after update', { productId: id });
    } catch (error) {
      this.logger.error('Error in cached update', error as Error, { productId: id });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Obtener el producto antes de eliminarlo para saber qué cachés invalidar
      const product = await this.repository.getById(id);
      await this.repository.delete(id);
      
      // Invalidar cachés relevantes
      if (product) {
        await Promise.all([
          this.cache.delete(this.getCacheKey('all')),
          this.cache.delete(this.getCacheKey('single', id)),
          this.cache.delete(this.getCacheKey('provider', product.providerId))
        ]);
      }
      
      this.logger.debug('Cache invalidated after delete', { productId: id });
    } catch (error) {
      this.logger.error('Error in cached delete', error as Error, { productId: id });
      throw error;
    }
  }

  subscribeToProviderProducts(
    providerId: string,
    callback: (products: Product[]) => void
  ): () => void {
    // Para suscripciones en tiempo real, omitimos el caché
    return this.repository.subscribeToProviderProducts(providerId, callback);
  }
}
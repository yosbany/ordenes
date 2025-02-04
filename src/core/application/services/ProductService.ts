import { Product } from '@/core/domain/entities';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { IEventBus } from '@/core/domain/events/IEventBus';
import { ILogger } from '@/core/domain/logging/ILogger';
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from '@/core/domain/events';
import { ProductValidator } from '@/core/domain/validators/ProductValidator';

export class ProductService {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async createProduct(product: Omit<Product, 'id'>): Promise<string> {
    try {
      this.logger.info('Creating new product', { providerId: product.providerId });

      // Validar producto
      const validationError = ProductValidator.validate(product);
      if (validationError) {
        throw validationError;
      }

      // Crear producto
      const productId = await this.productRepository.create(product);
      
      // Publicar evento
      this.eventBus.publish(new ProductCreatedEvent({ id: productId, ...product }));
      
      this.logger.info('Product created successfully', { productId });
      return productId;
    } catch (error) {
      this.logger.error('Error creating product', error as Error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      this.logger.info('Updating product', { productId: id });

      await this.productRepository.update(id, updates);
      
      // Publicar evento
      this.eventBus.publish(new ProductUpdatedEvent(id, updates));
      
      this.logger.info('Product updated successfully', { productId: id });
    } catch (error) {
      this.logger.error('Error updating product', error as Error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      this.logger.info('Deleting product', { productId: id });

      await this.productRepository.delete(id);
      
      // Publicar evento
      this.eventBus.publish(new ProductDeletedEvent(id));
      
      this.logger.info('Product deleted successfully', { productId: id });
    } catch (error) {
      this.logger.error('Error deleting product', error as Error);
      throw error;
    }
  }
}
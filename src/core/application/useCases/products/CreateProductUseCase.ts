import { Product } from '@/core/domain/entities';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { ProductValidator } from '@/core/domain/validators/ProductValidator';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(product: Omit<Product, 'id'>): Promise<string> {
    // Validate product
    const validationError = ProductValidator.validate(product);
    if (validationError) {
      throw new Error(validationError.message);
    }

    // Create product
    return await this.productRepository.create(product);
  }
}
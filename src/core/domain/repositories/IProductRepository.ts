import { Product } from '../entities';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getByProvider(providerId: string): Promise<Product[]>;
  create(product: Omit<Product, 'id'>): Promise<string>;
  update(id: string, product: Partial<Product>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToProviderProducts(
    providerId: string,
    callback: (products: Product[]) => void
  ): () => void;
}
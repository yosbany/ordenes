import { makeAutoObservable } from 'mobx';
import { Product } from '@/core/domain/entities';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { CreateProductUseCase } from '@/core/application/useCases/products/CreateProductUseCase';
import { toast } from 'react-hot-toast';

export class ProductViewModel {
  products: Product[] = [];
  loading = true;
  selectedProviderId = '';
  error: string | null = null;

  constructor(
    private productRepository: IProductRepository,
    private createProductUseCase: CreateProductUseCase
  ) {
    makeAutoObservable(this);
  }

  setSelectedProviderId(id: string) {
    this.selectedProviderId = id;
    this.loadProducts();
  }

  async loadProducts() {
    if (!this.selectedProviderId) {
      this.products = [];
      this.loading = false;
      return;
    }

    try {
      this.loading = true;
      this.error = null;
      const products = await this.productRepository.getByProvider(this.selectedProviderId);
      this.products = products;
    } catch (error) {
      this.error = 'Error al cargar los productos';
      toast.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  async createProduct(product: Omit<Product, 'id'>) {
    try {
      this.error = null;
      const productId = await this.createProductUseCase.execute(product);
      toast.success('Producto creado exitosamente');
      return productId;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Error al crear el producto';
      toast.error(this.error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      this.error = null;
      await this.productRepository.update(id, updates);
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      this.error = 'Error al actualizar el producto';
      toast.error(this.error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      this.error = null;
      await this.productRepository.delete(id);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      this.error = 'Error al eliminar el producto';
      toast.error(this.error);
      throw error;
    }
  }
}
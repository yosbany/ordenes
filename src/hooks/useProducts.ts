import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { container } from '@/presentation/di/container';
import { TYPES } from '@/presentation/di/types';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { toast } from 'react-hot-toast';

export function useProducts(providerId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const repository = container.get<IProductRepository>(TYPES.ProductRepository);

  useEffect(() => {
    if (!providerId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = repository.subscribeToProviderProducts(providerId, (updatedProducts) => {
      setProducts(updatedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId, repository]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await repository.create(product);
      toast.success('Producto creado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await repository.update(id, updates);
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await repository.delete(id);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
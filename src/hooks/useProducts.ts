import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';
import { validateProduct, formatProductData } from '@/lib/validation/productValidation';
import { createProduct, updateProductById, deleteProductById, getProductById } from '@/lib/services/database/products';
import { isKnownError, getErrorMessage, ValidationError } from '@/lib/services/errors';

export function useProducts(providerId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productsRef = ref(db, 'products');
    const providerProductsQuery = query(
      productsRef,
      orderByChild('providerId'),
      equalTo(providerId)
    );

    const unsubscribe = onValue(providerProductsQuery, (snapshot) => {
      const data = snapshot.val();
      const productsList = data
        ? Object.entries(data).map(([id, product]) => ({
            id,
            ...(product as Omit<Product, 'id'>),
          }))
        : [];
      setProducts(productsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [providerId]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Validate product data
      const validationError = validateProduct(product);
      if (validationError) {
        throw new ValidationError(validationError.message, validationError.field);
      }

      // Format product data
      const formattedProduct = formatProductData(product);

      // Save to database
      const productId = await createProduct(formattedProduct);
      return productId;
    } catch (error) {
      const message = isKnownError(error) ? error.message : 'Error al crear el producto';
      toast.error(message);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!id) {
      throw new ValidationError('ID de producto no válido');
    }

    try {
      // Get current product data
      const currentProduct = await getProductById(id);
      if (!currentProduct) {
        throw new ValidationError('Producto no encontrado');
      }

      // Merge updates with current data
      const updatedProduct = {
        ...currentProduct,
        ...updates
      };

      // Validate complete product data
      const validationError = validateProduct(updatedProduct);
      if (validationError) {
        throw new ValidationError(validationError.message, validationError.field);
      }

      // Format and save updates
      const formattedUpdates = formatProductData(updatedProduct);
      await updateProductById(id, formattedUpdates);

      return formattedUpdates;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!id) {
      throw new ValidationError('ID de producto no válido');
    }

    try {
      await deleteProductById(id);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
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
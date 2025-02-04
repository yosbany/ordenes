import { ref, push, update, remove, query, orderByChild, equalTo, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { Product } from '@/types';
import { DatabaseError } from '@/core/domain/errors';
import { validateProduct } from '@/lib/validation/productValidation';

export class FirebaseProductRepository {
  private readonly COLLECTION = 'products';

  private checkAuth() {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }
  }

  async getAll(): Promise<Product[]> {
    try {
      this.checkAuth();
      const productsRef = ref(db, this.COLLECTION);
      const snapshot = await get(productsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Product, 'id'>)
      }));
    } catch (error) {
      throw new DatabaseError('Failed to fetch products', { cause: error });
    }
  }

  async getById(id: string): Promise<Product | null> {
    try {
      this.checkAuth();
      const productRef = ref(db, `${this.COLLECTION}/${id}`);
      const snapshot = await get(productRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id,
        ...snapshot.val()
      } as Product;
    } catch (error) {
      throw new DatabaseError('Failed to fetch product', { cause: error });
    }
  }

  async getByProvider(providerId: string): Promise<Product[]> {
    try {
      this.checkAuth();
      const productsRef = ref(db, this.COLLECTION);
      const providerProductsQuery = query(
        productsRef,
        orderByChild('providerId'),
        equalTo(providerId)
      );

      const snapshot = await get(providerProductsQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...(data as Omit<Product, 'id'>)
        }))
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new DatabaseError('Failed to fetch provider products', { cause: error });
    }
  }

  async create(product: Omit<Product, 'id'>): Promise<string> {
    try {
      this.checkAuth();

      // Validate product data
      const validationError = validateProduct(product);
      if (validationError) {
        throw new DatabaseError(validationError.message);
      }

      const productsRef = ref(db, this.COLLECTION);
      const newProductRef = push(productsRef);
      
      if (!newProductRef.key) {
        throw new DatabaseError('Failed to generate product ID');
      }

      // Format data for saving
      const productData = {
        ...product,
        name: product.name.trim().toUpperCase(),
        sku: product.sku.trim().toUpperCase(),
        supplierCode: product.supplierCode?.trim().toUpperCase() || '',
        purchasePackaging: product.purchasePackaging.trim().toUpperCase(),
        salePackaging: product.salePackaging?.trim().toUpperCase() || '',
        price: Number(product.price) || 0,
        minPackageStock: Number(product.minPackageStock) || 0,
        desiredStock: Number(product.desiredStock) || 0,
        order: Number(product.order) || 0,
        tags: Array.isArray(product.tags) ? product.tags : [],
        isProduction: Boolean(product.isProduction),
        unitMeasure: product.isProduction ? (product.unitMeasure || 'UNIDAD') : undefined,
        pricePerUnit: product.isProduction ? (Number(product.pricePerUnit) || 0) : undefined
      };

      await update(newProductRef, productData);
      return newProductRef.key;
    } catch (error) {
      throw new DatabaseError('Failed to create product', { cause: error });
    }
  }

  async update(id: string, updates: Partial<Product>): Promise<void> {
    try {
      this.checkAuth();

      // Get current product data
      const productRef = ref(db, `${this.COLLECTION}/${id}`);
      const snapshot = await get(productRef);
      
      if (!snapshot.exists()) {
        throw new DatabaseError('Product not found');
      }

      const currentProduct = snapshot.val();
      
      // Merge and format data
      const updatedProduct = {
        ...currentProduct,
        ...updates,
        name: updates.name?.trim().toUpperCase() ?? currentProduct.name,
        sku: updates.sku?.trim().toUpperCase() ?? currentProduct.sku,
        supplierCode: updates.supplierCode?.trim().toUpperCase() ?? currentProduct.supplierCode ?? '',
        purchasePackaging: updates.purchasePackaging?.trim().toUpperCase() ?? currentProduct.purchasePackaging,
        salePackaging: updates.salePackaging?.trim().toUpperCase() ?? currentProduct.salePackaging ?? '',
        price: typeof updates.price === 'number' ? Number(updates.price) : currentProduct.price,
        minPackageStock: typeof updates.minPackageStock === 'number' ? Number(updates.minPackageStock) : currentProduct.minPackageStock,
        desiredStock: typeof updates.desiredStock === 'number' ? Number(updates.desiredStock) : currentProduct.desiredStock,
        order: typeof updates.order === 'number' ? Number(updates.order) : currentProduct.order,
        tags: updates.tags ?? currentProduct.tags ?? [],
        isProduction: typeof updates.isProduction === 'boolean' ? updates.isProduction : currentProduct.isProduction
      };

      // Handle production-specific fields
      if (updatedProduct.isProduction) {
        updatedProduct.unitMeasure = updates.unitMeasure?.trim().toUpperCase() ?? currentProduct.unitMeasure ?? 'UNIDAD';
        updatedProduct.pricePerUnit = typeof updates.pricePerUnit === 'number' ? Number(updates.pricePerUnit) : currentProduct.pricePerUnit ?? 0;
      } else {
        // Remove production fields if not a production material
        delete updatedProduct.unitMeasure;
        delete updatedProduct.pricePerUnit;
      }

      // Validate complete product data
      const validationError = validateProduct(updatedProduct);
      if (validationError) {
        throw new DatabaseError(validationError.message);
      }

      // Update the product
      await update(productRef, updatedProduct);
    } catch (error) {
      throw new DatabaseError('Failed to update product', { cause: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.checkAuth();
      const productRef = ref(db, `${this.COLLECTION}/${id}`);
      await remove(productRef);
    } catch (error) {
      throw new DatabaseError('Failed to delete product', { cause: error });
    }
  }

  subscribeToProviderProducts(
    providerId: string,
    callback: (products: Product[]) => void
  ): () => void {
    try {
      this.checkAuth();
      const productsRef = ref(db, this.COLLECTION);
      const providerProductsQuery = query(
        productsRef,
        orderByChild('providerId'),
        equalTo(providerId)
      );

      const unsubscribe = onValue(providerProductsQuery, (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const products = Object.entries(snapshot.val())
          .map(([id, data]) => ({
            id,
            ...(data as Omit<Product, 'id'>)
          }))
          .sort((a, b) => a.order - b.order);

        callback(products);
      });

      return unsubscribe;
    } catch (error) {
      throw new DatabaseError('Failed to subscribe to provider products', { cause: error });
    }
  }
}
import { FirebaseProductRepository } from '../FirebaseProductRepository';
import { Product } from '@/core/domain/entities';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

describe('FirebaseProductRepository', () => {
  let repository: FirebaseProductRepository;
  const COLLECTION = 'products';

  const mockProduct: Omit<Product, 'id'> = {
    name: 'Test Product',
    sku: 'TEST-001',
    purchasePackaging: 'CAJA',
    salePackaging: 'UNIDAD',
    order: 10100,
    price: 10.50,
    desiredStock: 10,
    minPackageStock: 5,
    providerId: 'provider-1',
    tags: ['test'],
    isProduction: false
  };

  beforeEach(async () => {
    repository = new FirebaseProductRepository();
    // Clear test data
    await remove(ref(db, COLLECTION));
  });

  afterEach(async () => {
    // Cleanup
    await remove(ref(db, COLLECTION));
  });

  describe('getAll', () => {
    it('should return empty array when no products exist', async () => {
      const products = await repository.getAll();
      expect(products).toEqual([]);
    });

    it('should return all products', async () => {
      const productsRef = ref(db, COLLECTION);
      await set(productsRef, {
        'product-1': { ...mockProduct },
        'product-2': { ...mockProduct }
      });

      const products = await repository.getAll();
      expect(products).toHaveLength(2);
      expect(products[0]).toHaveProperty('id');
      expect(products[0].name).toBe(mockProduct.name);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent product', async () => {
      const product = await repository.getById('non-existent');
      expect(product).toBeNull();
    });

    it('should return product by id', async () => {
      const productId = 'test-product';
      const productRef = ref(db, `${COLLECTION}/${productId}`);
      await set(productRef, mockProduct);

      const product = await repository.getById(productId);
      expect(product).not.toBeNull();
      expect(product?.id).toBe(productId);
      expect(product?.name).toBe(mockProduct.name);
    });
  });

  describe('getByProvider', () => {
    it('should return empty array when provider has no products', async () => {
      const products = await repository.getByProvider('non-existent');
      expect(products).toEqual([]);
    });

    it('should return provider products sorted by order', async () => {
      const productsRef = ref(db, COLLECTION);
      await set(productsRef, {
        'product-1': { ...mockProduct, order: 10200 },
        'product-2': { ...mockProduct, order: 10100 },
        'product-3': { ...mockProduct, providerId: 'other-provider' }
      });

      const products = await repository.getByProvider(mockProduct.providerId);
      expect(products).toHaveLength(2);
      expect(products[0].order).toBeLessThan(products[1].order);
    });
  });

  describe('create', () => {
    it('should create new product', async () => {
      const productId = await repository.create(mockProduct);
      expect(productId).toBeTruthy();

      const productRef = ref(db, `${COLLECTION}/${productId}`);
      const snapshot = await get(productRef);
      expect(snapshot.exists()).toBe(true);
      expect(snapshot.val()).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update existing product', async () => {
      const productId = 'test-product';
      const productRef = ref(db, `${COLLECTION}/${productId}`);
      await set(productRef, mockProduct);

      const updates = { price: 15.00 };
      await repository.update(productId, updates);

      const snapshot = await get(productRef);
      expect(snapshot.val().price).toBe(15.00);
    });

    it('should throw error for non-existent product', async () => {
      await expect(
        repository.update('non-existent', { price: 15.00 })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete existing product', async () => {
      const productId = 'test-product';
      const productRef = ref(db, `${COLLECTION}/${productId}`);
      await set(productRef, mockProduct);

      await repository.delete(productId);

      const snapshot = await get(productRef);
      expect(snapshot.exists()).toBe(false);
    });
  });

  describe('subscribeToProviderProducts', () => {
    it('should call callback with initial data', (done) => {
      const callback = (products: Product[]) => {
        expect(products).toEqual([]);
        unsubscribe();
        done();
      };

      const unsubscribe = repository.subscribeToProviderProducts(
        mockProduct.providerId,
        callback
      );
    });

    it('should call callback when data changes', (done) => {
      let callCount = 0;
      
      const callback = (products: Product[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(products).toEqual([]);
          
          // Add test data
          const productsRef = ref(db, COLLECTION);
          set(productsRef, {
            'product-1': mockProduct
          });
        }
        
        if (callCount === 2) {
          // Data after change
          expect(products).toHaveLength(1);
          expect(products[0].name).toBe(mockProduct.name);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToProviderProducts(
        mockProduct.providerId,
        callback
      );
    });
  });
});
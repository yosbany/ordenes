import { FirebaseOrderRepository } from '../FirebaseOrderRepository';
import { Order } from '@/core/domain/entities';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

describe('FirebaseOrderRepository', () => {
  let repository: FirebaseOrderRepository;
  const COLLECTION = 'orders';

  const mockOrder: Omit<Order, 'id'> = {
    providerId: 'provider-1',
    date: Date.now(),
    status: 'pending',
    items: [
      {
        productId: 'product-1',
        quantity: 2,
        price: 10.50,
        subtotal: 21.00
      }
    ],
    total: 21.00
  };

  beforeEach(async () => {
    repository = new FirebaseOrderRepository();
    // Clear test data
    await remove(ref(db, COLLECTION));
  });

  afterEach(async () => {
    // Cleanup
    await remove(ref(db, COLLECTION));
  });

  describe('getAll', () => {
    it('should return empty array when no orders exist', async () => {
      const orders = await repository.getAll();
      expect(orders).toEqual([]);
    });

    it('should return all orders', async () => {
      const ordersRef = ref(db, COLLECTION);
      await set(ordersRef, {
        'order-1': { ...mockOrder },
        'order-2': { ...mockOrder }
      });

      const orders = await repository.getAll();
      expect(orders).toHaveLength(2);
      expect(orders[0]).toHaveProperty('id');
      expect(orders[0].providerId).toBe(mockOrder.providerId);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent order', async () => {
      const order = await repository.getById('non-existent');
      expect(order).toBeNull();
    });

    it('should return order by id', async () => {
      const orderId = 'test-order';
      const orderRef = ref(db, `${COLLECTION}/${orderId}`);
      await set(orderRef, mockOrder);

      const order = await repository.getById(orderId);
      expect(order).not.toBeNull();
      expect(order?.id).toBe(orderId);
      expect(order?.providerId).toBe(mockOrder.providerId);
    });
  });

  describe('getByProvider', () => {
    it('should return empty array when provider has no orders', async () => {
      const orders = await repository.getByProvider('non-existent');
      expect(orders).toEqual([]);
    });

    it('should return provider orders sorted by date', async () => {
      const ordersRef = ref(db, COLLECTION);
      const now = Date.now();
      
      await set(ordersRef, {
        'order-1': { ...mockOrder, date: now - 1000 },
        'order-2': { ...mockOrder, date: now },
        'order-3': { ...mockOrder, providerId: 'other-provider' }
      });

      const orders = await repository.getByProvider(mockOrder.providerId);
      expect(orders).toHaveLength(2);
      expect(orders[0].date).toBeGreaterThan(orders[1].date);
    });
  });

  describe('create', () => {
    it('should create new order', async () => {
      const orderId = await repository.create(mockOrder);
      expect(orderId).toBeTruthy();

      const orderRef = ref(db, `${COLLECTION}/${orderId}`);
      const snapshot = await get(orderRef);
      expect(snapshot.exists()).toBe(true);
      expect(snapshot.val()).toEqual(mockOrder);
    });
  });

  describe('update', () => {
    it('should update existing order', async () => {
      const orderId = 'test-order';
      const orderRef = ref(db, `${COLLECTION}/${orderId}`);
      await set(orderRef, mockOrder);

      const updates = { status: 'completed' as const };
      await repository.update(orderId, updates);

      const snapshot = await get(orderRef);
      expect(snapshot.val().status).toBe('completed');
    });

    it('should throw error for non-existent order', async () => {
      await expect(
        repository.update('non-existent', { status: 'completed' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete existing order', async () => {
      const orderId = 'test-order';
      const orderRef = ref(db, `${COLLECTION}/${orderId}`);
      await set(orderRef, mockOrder);

      await repository.delete(orderId);

      const snapshot = await get(orderRef);
      expect(snapshot.exists()).toBe(false);
    });
  });

  describe('subscribeToProviderOrders', () => {
    it('should call callback with initial data', (done) => {
      const callback = (orders: Order[]) => {
        expect(orders).toEqual([]);
        unsubscribe();
        done();
      };

      const unsubscribe = repository.subscribeToProviderOrders(
        mockOrder.providerId,
        callback
      );
    });

    it('should call callback when data changes', (done) => {
      let callCount = 0;
      
      const callback = (orders: Order[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(orders).toEqual([]);
          
          // Add test data
          const ordersRef = ref(db, COLLECTION);
          set(ordersRef, {
            'order-1': mockOrder
          });
        }
        
        if (callCount === 2) {
          // Data after change
          expect(orders).toHaveLength(1);
          expect(orders[0].providerId).toBe(mockOrder.providerId);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToProviderOrders(
        mockOrder.providerId,
        callback
      );
    });
  });
});
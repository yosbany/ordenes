import { ref, push, update, remove, query, orderByChild, equalTo, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { Order } from '@/core/domain/entities';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { DatabaseError } from '@/core/domain/errors';

export class FirebaseOrderRepository implements IOrderRepository {
  private readonly COLLECTION = 'orders';

  private checkAuth() {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }
  }

  async getAll(): Promise<Order[]> {
    try {
      this.checkAuth();
      const ordersRef = ref(db, this.COLLECTION);
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Order, 'id'>)
      }));
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch orders', { cause: error });
    }
  }

  async getById(id: string): Promise<Order | null> {
    try {
      this.checkAuth();
      const orderRef = ref(db, `${this.COLLECTION}/${id}`);
      const snapshot = await get(orderRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id,
        ...snapshot.val()
      } as Order;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch order', { cause: error });
    }
  }

  async getByProvider(providerId: string): Promise<Order[]> {
    try {
      this.checkAuth();
      const ordersRef = ref(db, this.COLLECTION);
      const providerOrdersQuery = query(
        ordersRef,
        orderByChild('providerId'),
        equalTo(providerId)
      );

      const snapshot = await get(providerOrdersQuery);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...(data as Omit<Order, 'id'>)
        }))
        .sort((a, b) => b.date - a.date);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch provider orders', { cause: error });
    }
  }

  async create(order: Omit<Order, 'id'>): Promise<string> {
    try {
      this.checkAuth();
      const ordersRef = ref(db, this.COLLECTION);
      const newOrderRef = push(ordersRef);
      
      if (!newOrderRef.key) {
        throw new DatabaseError('Failed to generate order ID');
      }

      await update(newOrderRef, order);
      return newOrderRef.key;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to create order', { cause: error });
    }
  }

  async update(id: string, updates: Partial<Order>): Promise<void> {
    try {
      this.checkAuth();
      const orderRef = ref(db, `${this.COLLECTION}/${id}`);
      await update(orderRef, updates);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to update order', { cause: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.checkAuth();
      const orderRef = ref(db, `${this.COLLECTION}/${id}`);
      await remove(orderRef);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete order', { cause: error });
    }
  }

  subscribeToProviderOrders(
    providerId: string,
    callback: (orders: Order[]) => void
  ): () => void {
    try {
      this.checkAuth();
      const ordersRef = ref(db, this.COLLECTION);
      const providerOrdersQuery = query(
        ordersRef,
        orderByChild('providerId'),
        equalTo(providerId)
      );

      const unsubscribe = onValue(providerOrdersQuery, (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const orders = Object.entries(snapshot.val())
          .map(([id, data]) => ({
            id,
            ...(data as Omit<Order, 'id'>)
          }))
          .sort((a, b) => b.date - a.date);

        callback(orders);
      });

      return unsubscribe;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to subscribe to provider orders', { cause: error });
    }
  }
}
import { Order } from '@/types';
import { 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  queryByField,
  getCollection,
  subscribeToCollection 
} from './database';
import { ref, query, orderByChild, equalTo, onValue, get } from 'firebase/database';
import { db } from './database';

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  subscribeToProviderOrders(providerId: string, callback: (orders: Order[]) => void): () => void {
    const ordersRef = ref(db, ORDERS_COLLECTION);
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

      const orders = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Order, 'id'>)
      }));

      // Sort orders by date in descending order
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      callback(sortedOrders);
    });

    return unsubscribe;
  },

  async getByProvider(providerId: string): Promise<Order[]> {
    try {
      const orders = await queryByField<Order>(ORDERS_COLLECTION, 'providerId', providerId);
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching provider orders:', error);
      return [];
    }
  },

  async create(data: Omit<Order, 'id'>): Promise<string> {
    try {
      return await createDocument(ORDERS_COLLECTION, data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Order>): Promise<void> {
    try {
      // First get the current order
      const orderRef = ref(db, `${ORDERS_COLLECTION}/${id}`);
      const snapshot = await get(orderRef);
      
      if (!snapshot.exists()) {
        throw new Error('Order not found');
      }

      // Merge current order with updates
      const currentOrder = snapshot.val();
      const updatedOrder = {
        ...currentOrder,
        ...updates
      };

      // Update the order with merged data
      await updateDocument(ORDERS_COLLECTION, id, updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDocument(ORDERS_COLLECTION, id);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

export async function getProviderOrders(providerId: string): Promise<Order[]> {
  try {
    const orders = await queryByField<Order>(ORDERS_COLLECTION, 'providerId', providerId);
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching provider orders:', error);
    return [];
  }
}

export async function getTodayOrdersCount(providerId: string): Promise<number> {
  try {
    const orders = await queryByField<Order>(ORDERS_COLLECTION, 'providerId', providerId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;
  } catch (error) {
    console.error('Error fetching today orders count:', error);
    return 0;
  }
}
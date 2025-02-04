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
import { auth } from '@/lib/firebase/auth';
import { toast } from 'react-hot-toast';

const ORDERS_COLLECTION = 'orders';

export async function getProviderOrders(providerId: string): Promise<Order[]> {
  if (!auth.currentUser) {
    console.warn('User not authenticated, returning empty orders');
    return [];
  }

  try {
    const orders = await queryByField<Order>(ORDERS_COLLECTION, 'providerId', providerId);
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching provider orders:', error);
    toast.error('Error al cargar las órdenes');
    return [];
  }
}

export const orderService = {
  subscribeToProviderOrders(providerId: string, callback: (orders: Order[]) => void): () => void {
    if (!auth.currentUser) {
      console.warn('User not authenticated, skipping subscription');
      callback([]);
      return () => {};
    }

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
    }, (error) => {
      console.error('Error fetching provider orders:', error);
      toast.error('Error al cargar las órdenes');
      callback([]);
    });

    return unsubscribe;
  },

  async getByProvider(providerId: string): Promise<Order[]> {
    return getProviderOrders(providerId);
  },

  async create(data: Omit<Order, 'id'>): Promise<string> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      return await createDocument(ORDERS_COLLECTION, data);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Order>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

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
      toast.error('Error al actualizar la orden');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await deleteDocument(ORDERS_COLLECTION, id);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar la orden');
      throw error;
    }
  }
};

// Re-export all functions from orderService
export const {
  subscribeToProviderOrders,
  getByProvider,
  create,
  update,
  delete: deleteOrder // Renamed to avoid conflict with keyword
} = orderService;
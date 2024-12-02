import { ref, push, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export async function saveOrder(
  order: Omit<Order, 'id'>, 
  orderId?: string
): Promise<string | null> {
  try {
    // Initialize orders collection if it doesn't exist
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (!snapshot.exists()) {
      await set(ordersRef, {});
    }

    // Format order data with proper number handling
    const formattedOrder = {
      providerId: order.providerId,
      date: new Date().toISOString(),
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(Number(item.price).toFixed(2)),
        subtotal: Number(Number(item.price * item.quantity).toFixed(2))
      })),
      total: Number(order.items.reduce((sum, item) => 
        sum + Number(item.price) * Number(item.quantity), 
        0
      ).toFixed(2))
    };

    // Save order
    if (orderId) {
      const orderRef = ref(db, `orders/${orderId}`);
      await set(orderRef, formattedOrder);
      return orderId;
    } else {
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, formattedOrder);
      return newOrderRef.key;
    }
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await set(orderRef, null);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

export async function getOrdersForProvider(providerId: string): Promise<Order[]> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val())
      .map(([id, data]) => ({
        id,
        ...(data as Omit<Order, 'id'>)
      }))
      .filter(order => order.providerId === providerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}
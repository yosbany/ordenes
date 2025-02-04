export interface Order {
  id?: string;
  providerId: string;
  date: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'completed';
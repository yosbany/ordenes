import { Order } from '../entities';

export interface IOrderRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  getByProvider(providerId: string): Promise<Order[]>;
  create(order: Omit<Order, 'id'>): Promise<string>;
  update(id: string, order: Partial<Order>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToProviderOrders(
    providerId: string,
    callback: (orders: Order[]) => void
  ): () => void;
}
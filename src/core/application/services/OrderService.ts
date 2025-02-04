import { Order } from '@/core/domain/entities';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { IEventBus } from '@/core/domain/events/IEventBus';
import { ILogger } from '@/core/domain/logging/ILogger';
import { OrderCreatedEvent, OrderUpdatedEvent, OrderDeletedEvent } from '@/core/domain/events';
import { OrderValidator } from '@/core/domain/validators/OrderValidator';

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async createOrder(order: Omit<Order, 'id'>): Promise<string> {
    try {
      this.logger.info('Creating new order', { providerId: order.providerId });

      // Validar orden
      const validationError = OrderValidator.validate(order);
      if (validationError) {
        throw new Error(validationError);
      }

      // Crear orden
      const orderId = await this.orderRepository.create(order);
      
      // Publicar evento
      this.eventBus.publish(new OrderCreatedEvent({ id: orderId, ...order }));
      
      this.logger.info('Order created successfully', { orderId });
      return orderId;
    } catch (error) {
      this.logger.error('Error creating order', error as Error);
      throw error;
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    try {
      this.logger.info('Updating order', { orderId: id });

      await this.orderRepository.update(id, updates);
      
      // Publicar evento
      this.eventBus.publish(new OrderUpdatedEvent(id, updates));
      
      this.logger.info('Order updated successfully', { orderId: id });
    } catch (error) {
      this.logger.error('Error updating order', error as Error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      this.logger.info('Deleting order', { orderId: id });

      await this.orderRepository.delete(id);
      
      // Publicar evento
      this.eventBus.publish(new OrderDeletedEvent(id));
      
      this.logger.info('Order deleted successfully', { orderId: id });
    } catch (error) {
      this.logger.error('Error deleting order', error as Error);
      throw error;
    }
  }
}
import { Order } from '@/core/domain/entities';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { OrderValidator } from '@/core/domain/validators/OrderValidator';

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(order: Omit<Order, 'id'>): Promise<string> {
    // Validate order
    const validationError = OrderValidator.validate(order);
    if (validationError) {
      throw new Error(validationError);
    }

    // Create order
    return await this.orderRepository.create(order);
  }
}
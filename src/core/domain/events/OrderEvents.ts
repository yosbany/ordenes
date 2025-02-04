import { Order } from '../entities';

export class OrderCreatedEvent {
  constructor(public readonly order: Order) {}
}

export class OrderUpdatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly updates: Partial<Order>
  ) {}
}

export class OrderDeletedEvent {
  constructor(public readonly orderId: string) {}
}
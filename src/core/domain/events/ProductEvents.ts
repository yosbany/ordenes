import { Product } from '../entities';

export class ProductCreatedEvent {
  constructor(public readonly product: Product) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly updates: Partial<Product>
  ) {}
}

export class ProductDeletedEvent {
  constructor(public readonly productId: string) {}
}
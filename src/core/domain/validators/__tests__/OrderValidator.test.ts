import { OrderValidator } from '../OrderValidator';
import { Order } from '../../entities';

describe('OrderValidator', () => {
  const validOrder: Omit<Order, 'id'> = {
    providerId: 'provider-1',
    date: Date.now(),
    status: 'pending',
    items: [
      {
        productId: 'product-1',
        quantity: 2,
        price: 10.50,
        subtotal: 21.00
      }
    ],
    total: 21.00
  };

  it('should validate a valid order', () => {
    const result = OrderValidator.validate(validOrder);
    expect(result).toBeNull();
  });

  it('should require providerId', () => {
    const order = { ...validOrder, providerId: '' };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Provider ID is required');
  });

  it('should require at least one item', () => {
    const order = { ...validOrder, items: [] };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Order must have at least one item');
  });

  it('should validate item quantity', () => {
    const order = {
      ...validOrder,
      items: [{ ...validOrder.items[0], quantity: 0 }]
    };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Quantity must be greater than 0');
  });

  it('should validate item price', () => {
    const order = {
      ...validOrder,
      items: [{ ...validOrder.items[0], price: -1 }]
    };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Price must be greater than 0');
  });

  it('should validate subtotal calculation', () => {
    const order = {
      ...validOrder,
      items: [{
        ...validOrder.items[0],
        subtotal: 25.00 // Incorrect subtotal
      }]
    };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Invalid subtotal calculation');
  });

  it('should validate total calculation', () => {
    const order = { ...validOrder, total: 25.00 }; // Incorrect total
    const result = OrderValidator.validate(order);
    expect(result).toBe('Invalid total calculation');
  });

  it('should not allow duplicate products', () => {
    const order = {
      ...validOrder,
      items: [
        validOrder.items[0],
        validOrder.items[0] // Duplicate product
      ]
    };
    const result = OrderValidator.validate(order);
    expect(result).toBe('Duplicate products are not allowed');
  });
});
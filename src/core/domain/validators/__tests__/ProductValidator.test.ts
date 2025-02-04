import { ProductValidator } from '../ProductValidator';
import { Product } from '../../entities';

describe('ProductValidator', () => {
  const validProduct: Omit<Product, 'id'> = {
    name: 'Test Product',
    sku: 'TEST-001',
    purchasePackaging: 'CAJA',
    salePackaging: 'UNIDAD',
    order: 10100,
    price: 10.50,
    desiredStock: 10,
    minPackageStock: 5,
    providerId: 'provider-1',
    tags: ['test'],
    isProduction: false
  };

  it('should validate a valid product', () => {
    const result = ProductValidator.validate(validProduct);
    expect(result).toBeNull();
  });

  it('should require name', () => {
    const product = { ...validProduct, name: '' };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('name');
    expect(result?.message).toBe('El nombre es requerido');
  });

  it('should require SKU', () => {
    const product = { ...validProduct, sku: '' };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('sku');
    expect(result?.message).toBe('El SKU es requerido');
  });

  it('should require purchase packaging', () => {
    const product = { ...validProduct, purchasePackaging: '' };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('purchasePackaging');
    expect(result?.message).toBe('El empaque de compra es requerido');
  });

  it('should require providerId', () => {
    const product = { ...validProduct, providerId: '' };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('providerId');
    expect(result?.message).toBe('El proveedor es requerido');
  });

  it('should validate minPackageStock is a valid number', () => {
    const product = { ...validProduct, minPackageStock: NaN };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('minPackageStock');
    expect(result?.message).toBe('El stock mínimo debe ser un número válido');
  });

  it('should validate desiredStock is a valid number', () => {
    const product = { ...validProduct, desiredStock: NaN };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('desiredStock');
    expect(result?.message).toBe('El stock deseado debe ser un número válido');
  });

  it('should not allow negative minPackageStock', () => {
    const product = { ...validProduct, minPackageStock: -1 };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('minPackageStock');
    expect(result?.message).toBe('El stock mínimo no puede ser negativo');
  });

  it('should not allow negative desiredStock', () => {
    const product = { ...validProduct, desiredStock: -1 };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('desiredStock');
    expect(result?.message).toBe('El stock deseado no puede ser negativo');
  });

  it('should validate minPackageStock is not greater than desiredStock', () => {
    const product = { 
      ...validProduct, 
      minPackageStock: 10,
      desiredStock: 5
    };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('minPackageStock');
    expect(result?.message).toBe('El stock mínimo no puede ser mayor al stock deseado');
  });

  it('should validate price is a valid number', () => {
    const product = { ...validProduct, price: NaN };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('price');
    expect(result?.message).toBe('El precio debe ser un número válido');
  });

  it('should not allow negative price', () => {
    const product = { ...validProduct, price: -1 };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('price');
    expect(result?.message).toBe('El precio no puede ser negativo');
  });

  it('should validate order is a valid number', () => {
    const product = { ...validProduct, order: NaN };
    const result = ProductValidator.validate(product);
    expect(result?.field).toBe('order');
    expect(result?.message).toBe('El orden debe ser un número válido');
  });
});
import { ProviderValidator } from '../ProviderValidator';
import { Provider } from '../../entities';

describe('ProviderValidator', () => {
  const validProvider: Omit<Provider, 'id'> = {
    commercialName: 'Test Provider',
    legalName: 'Test Legal Name',
    rut: '123456789012',
    phone: '93609319',
    deliveryDays: ['monday'],
    orderDays: ['monday']
  };

  it('should validate a valid provider', () => {
    const result = ProviderValidator.validate(validProvider);
    expect(result).toBeNull();
  });

  it('should require commercial name', () => {
    const provider = { ...validProvider, commercialName: '' };
    const result = ProviderValidator.validate(provider);
    expect(result?.field).toBe('commercialName');
    expect(result?.message).toBe('El nombre comercial es requerido');
  });

  it('should validate phone number format', () => {
    const provider = { ...validProvider, phone: '123' };
    const result = ProviderValidator.validate(provider);
    expect(result?.field).toBe('phone');
    expect(result?.message).toBe('Número de teléfono inválido');
  });

  it('should validate RUT format', () => {
    const provider = { ...validProvider, rut: '123' };
    const result = ProviderValidator.validate(provider);
    expect(result?.field).toBe('rut');
    expect(result?.message).toBe('RUT inválido');
  });

  it('should allow empty phone', () => {
    const provider = { ...validProvider, phone: undefined };
    const result = ProviderValidator.validate(provider);
    expect(result).toBeNull();
  });

  it('should allow empty RUT', () => {
    const provider = { ...validProvider, rut: undefined };
    const result = ProviderValidator.validate(provider);
    expect(result).toBeNull();
  });

  it('should validate phone with country code', () => {
    const provider = { ...validProvider, phone: '59893609319' };
    const result = ProviderValidator.validate(provider);
    expect(result).toBeNull();
  });
});
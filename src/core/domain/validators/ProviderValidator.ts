import { Provider } from '../entities';
import { ValidationError } from '../errors';
import { validatePhoneNumber } from '@/lib/utils';

export class ProviderValidator {
  static validate(data: Omit<Provider, 'id'>): ValidationError | null {
    // Required fields
    if (!data.commercialName?.trim()) {
      return new ValidationError('El nombre comercial es requerido', 'commercialName');
    }

    // Phone validation
    if (data.phone && !validatePhoneNumber(data.phone)) {
      return new ValidationError('Número de teléfono inválido', 'phone');
    }

    // RUT validation (basic format check)
    if (data.rut && !/^\d{12}$/.test(data.rut.replace(/\D/g, ''))) {
      return new ValidationError('RUT inválido', 'rut');
    }

    return null;
  }
}
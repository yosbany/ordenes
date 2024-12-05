import { toast } from 'react-hot-toast';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProductStock(minStock: number, desiredStock: number): ValidationError | null {
  if (minStock > desiredStock) {
    return {
      field: 'minPackageStock',
      message: 'El stock mínimo no puede ser mayor al stock deseado'
    };
  }
  return null;
}

export function showValidationError(error: ValidationError) {
  toast.error(error.message);
}
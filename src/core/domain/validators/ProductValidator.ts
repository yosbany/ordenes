import { Product } from '../entities';
import { ValidationError } from '../errors';

export class ProductValidator {
  static validate(data: Omit<Product, 'id'>): ValidationError | null {
    // Required fields
    if (!data.name?.trim()) {
      return new ValidationError('El nombre es requerido', 'name');
    }

    if (!data.sku?.trim()) {
      return new ValidationError('El SKU es requerido', 'sku');
    }

    if (!data.purchasePackaging?.trim()) {
      return new ValidationError('El empaque de compra es requerido', 'purchasePackaging');
    }

    if (!data.providerId) {
      return new ValidationError('El proveedor es requerido', 'providerId');
    }

    // Stock validation
    if (typeof data.minPackageStock !== 'number' || isNaN(data.minPackageStock)) {
      return new ValidationError('El stock mínimo debe ser un número válido', 'minPackageStock');
    }

    if (typeof data.desiredStock !== 'number' || isNaN(data.desiredStock)) {
      return new ValidationError('El stock deseado debe ser un número válido', 'desiredStock');
    }

    if (data.minPackageStock < 0) {
      return new ValidationError('El stock mínimo no puede ser negativo', 'minPackageStock');
    }

    if (data.desiredStock < 0) {
      return new ValidationError('El stock deseado no puede ser negativo', 'desiredStock');
    }

    if (data.minPackageStock > data.desiredStock) {
      return new ValidationError('El stock mínimo no puede ser mayor al stock deseado', 'minPackageStock');
    }

    // Price validation
    if (typeof data.price !== 'number' || isNaN(data.price)) {
      return new ValidationError('El precio debe ser un número válido', 'price');
    }

    if (data.price < 0) {
      return new ValidationError('El precio no puede ser negativo', 'price');
    }

    // Order validation
    if (typeof data.order !== 'number' || isNaN(data.order)) {
      return new ValidationError('El orden debe ser un número válido', 'order');
    }

    return null;
  }
}
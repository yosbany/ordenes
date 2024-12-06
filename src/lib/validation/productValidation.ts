import { Product } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProduct(data: Omit<Product, 'id'>): ValidationError | null {
  // Required fields
  if (!data.name?.trim()) {
    return { field: 'name', message: 'El nombre es requerido' };
  }

  if (!data.sku?.trim()) {
    return { field: 'sku', message: 'El SKU es requerido' };
  }

  if (!data.purchasePackaging?.trim()) {
    return { field: 'purchasePackaging', message: 'El empaque de compra es requerido' };
  }

  if (!data.providerId) {
    return { field: 'providerId', message: 'El proveedor es requerido' };
  }

  // Stock validation
  if (typeof data.minPackageStock !== 'number' || isNaN(data.minPackageStock)) {
    return { field: 'minPackageStock', message: 'El stock mínimo debe ser un número válido' };
  }

  if (typeof data.desiredStock !== 'number' || isNaN(data.desiredStock)) {
    return { field: 'desiredStock', message: 'El stock deseado debe ser un número válido' };
  }

  if (data.minPackageStock < 0) {
    return { field: 'minPackageStock', message: 'El stock mínimo no puede ser negativo' };
  }

  if (data.desiredStock < 0) {
    return { field: 'desiredStock', message: 'El stock deseado no puede ser negativo' };
  }

  if (data.minPackageStock > data.desiredStock) {
    return { field: 'minPackageStock', message: 'El stock mínimo no puede ser mayor al stock deseado' };
  }

  // Price validation - allow zero or positive numbers
  if (typeof data.price !== 'number' || isNaN(data.price)) {
    return { field: 'price', message: 'El precio debe ser un número válido' };
  }

  if (data.price < 0) {
    return { field: 'price', message: 'El precio no puede ser negativo' };
  }

  // Order validation
  if (typeof data.order !== 'number' || isNaN(data.order)) {
    return { field: 'order', message: 'El orden debe ser un número válido' };
  }

  return null;
}

export function formatProductData(data: Omit<Product, 'id'>): Omit<Product, 'id'> {
  return {
    name: data.name.trim().toUpperCase(),
    sku: data.sku.trim().toUpperCase(),
    supplierCode: data.supplierCode?.trim().toUpperCase() || '',
    purchasePackaging: data.purchasePackaging.trim().toUpperCase(),
    salePackaging: data.salePackaging?.trim().toUpperCase() || '',
    price: Number(data.price),
    minPackageStock: Number(data.minPackageStock),
    desiredStock: Number(data.desiredStock),
    order: Number(data.order),
    providerId: data.providerId,
    tags: data.tags || []
  };
}
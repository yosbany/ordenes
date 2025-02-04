import { Recipe } from '../entities';
import { ValidationError } from '../errors';

export class RecipeValidator {
  static validate(data: Omit<Recipe, 'id'>): ValidationError | null {
    // Required fields
    if (!data.name?.trim()) {
      return new ValidationError('El nombre es requerido', 'name');
    }

    if (!data.yieldUnit?.trim()) {
      return new ValidationError('La unidad de rendimiento es requerida', 'yieldUnit');
    }

    // Yield validation
    if (typeof data.yield !== 'number' || isNaN(data.yield) || data.yield <= 0) {
      return new ValidationError('El rendimiento debe ser un número mayor a 0', 'yield');
    }

    // Materials validation
    if (!data.materials || data.materials.length === 0) {
      return new ValidationError('Debe agregar al menos un material', 'materials');
    }

    // Validate each material
    for (const material of data.materials) {
      if (!material.productId) {
        return new ValidationError('Material inválido', 'materials');
      }

      if (material.quantity <= 0) {
        return new ValidationError('La cantidad debe ser mayor a 0', 'materials');
      }

      if (material.unitCost <= 0) {
        return new ValidationError('El costo unitario debe ser mayor a 0', 'materials');
      }

      // Validate total cost calculation
      const expectedTotalCost = Number((material.quantity * material.unitCost).toFixed(2));
      if (Math.abs(material.totalCost - expectedTotalCost) > 0.01) {
        return new ValidationError('Error en el cálculo del costo total', 'materials');
      }
    }

    // Percentage validations
    if (data.fixedCostPercentage < 0 || data.fixedCostPercentage > 100) {
      return new ValidationError('El porcentaje de costos fijos debe estar entre 0 y 100', 'fixedCostPercentage');
    }

    if (data.profitPercentage < 0 || data.profitPercentage > 100) {
      return new ValidationError('El porcentaje de beneficio debe estar entre 0 y 100', 'profitPercentage');
    }

    return null;
  }
}
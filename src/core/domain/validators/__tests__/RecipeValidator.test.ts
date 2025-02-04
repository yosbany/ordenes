import { RecipeValidator } from '../RecipeValidator';
import { Recipe } from '../../entities';

describe('RecipeValidator', () => {
  const validRecipe: Omit<Recipe, 'id'> = {
    name: 'Test Recipe',
    yield: 10,
    yieldUnit: 'UNIDAD',
    materials: [
      {
        productId: 'product-1',
        quantity: 2,
        unit: 'CAJA',
        unitCost: 10.50,
        totalCost: 21.00
      }
    ],
    fixedCostPercentage: 20,
    profitPercentage: 30,
    notes: 'Test notes',
    totalCost: 25.20,
    unitCost: 2.52,
    suggestedPrice: 3.28,
    lastUpdated: Date.now()
  };

  it('should validate a valid recipe', () => {
    const result = RecipeValidator.validate(validRecipe);
    expect(result).toBeNull();
  });

  it('should require name', () => {
    const recipe = { ...validRecipe, name: '' };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('name');
    expect(result?.message).toBe('El nombre es requerido');
  });

  it('should require yield unit', () => {
    const recipe = { ...validRecipe, yieldUnit: '' };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('yieldUnit');
    expect(result?.message).toBe('La unidad de rendimiento es requerida');
  });

  it('should validate yield is greater than 0', () => {
    const recipe = { ...validRecipe, yield: 0 };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('yield');
    expect(result?.message).toBe('El rendimiento debe ser un número mayor a 0');
  });

  it('should require at least one material', () => {
    const recipe = { ...validRecipe, materials: [] };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('materials');
    expect(result?.message).toBe('Debe agregar al menos un material');
  });

  it('should validate material quantity', () => {
    const recipe = {
      ...validRecipe,
      materials: [{ ...validRecipe.materials[0], quantity: 0 }]
    };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('materials');
    expect(result?.message).toBe('La cantidad debe ser mayor a 0');
  });

  it('should validate material unit cost', () => {
    const recipe = {
      ...validRecipe,
      materials: [{ ...validRecipe.materials[0], unitCost: 0 }]
    };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('materials');
    expect(result?.message).toBe('El costo unitario debe ser mayor a 0');
  });

  it('should validate material total cost calculation', () => {
    const recipe = {
      ...validRecipe,
      materials: [{
        ...validRecipe.materials[0],
        totalCost: 25.00 // Incorrect total
      }]
    };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('materials');
    expect(result?.message).toBe('Error en el cálculo del costo total');
  });

  it('should validate fixed cost percentage range', () => {
    const recipe = { ...validRecipe, fixedCostPercentage: 101 };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('fixedCostPercentage');
    expect(result?.message).toBe('El porcentaje de costos fijos debe estar entre 0 y 100');
  });

  it('should validate profit percentage range', () => {
    const recipe = { ...validRecipe, profitPercentage: 101 };
    const result = RecipeValidator.validate(recipe);
    expect(result?.field).toBe('profitPercentage');
    expect(result?.message).toBe('El porcentaje de beneficio debe estar entre 0 y 100');
  });
});
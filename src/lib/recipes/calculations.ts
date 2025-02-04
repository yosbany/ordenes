import { RecipeMaterial } from '@/types/recipe';
import { Product } from '@/types';

interface RecipeCosts {
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  costHistory?: {
    date: number;
    unitCost: number;
    changePercentage: number;
  }[];
}

export function calculateRecipeCosts(
  materials: RecipeMaterial[],
  products: Product[],
  yield_: number,
  fixedCostPercentage: number,
  profitPercentage: number,
  previousUnitCost?: number
): RecipeCosts {
  // Calculate total material cost
  const materialsCost = materials.reduce((sum, material) => {
    const product = products.find(p => p.id === material.productId);
    if (!product) return sum;

    // Use pricePerUnit if available, otherwise use 0
    const unitCost = product.pricePerUnit || 0;
    return sum + (unitCost * material.quantity);
  }, 0);

  // Calculate fixed costs
  const fixedCosts = (materialsCost * fixedCostPercentage) / 100;

  // Calculate total cost
  const totalCost = materialsCost + fixedCosts;

  // Calculate unit cost
  const unitCost = yield_ > 0 ? totalCost / yield_ : 0;

  // Calculate suggested price using the formula:
  // suggestedPrice = unitCost / (1 - profitPercentage/100)
  const profitDecimal = profitPercentage / 100;
  const suggestedPrice = profitDecimal < 1 ? unitCost / (1 - profitDecimal) : unitCost * 2;

  // Calculate cost history entry if previous unit cost exists
  const costHistory = previousUnitCost ? [{
    date: Date.now(),
    unitCost,
    changePercentage: ((unitCost - previousUnitCost) / previousUnitCost) * 100
  }] : undefined;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    unitCost: Number(unitCost.toFixed(2)),
    suggestedPrice: Number(suggestedPrice.toFixed(2)),
    costHistory
  };
}
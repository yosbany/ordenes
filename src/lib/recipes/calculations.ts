import { Recipe, RecipeMaterial } from '@/types/recipe';
import { Product } from '@/types';

export interface RecipeCosts {
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  costHistory?: {
    date: number;
    unitCost: number;
    changePercentage: number;
  }[];
}

// Calculate fixed cost percentage
export function calculateFixedCostPercentage(
  totalMaterialsCost: number,
  totalFixedCosts: number
): number {
  if (totalMaterialsCost <= 0) return 0;
  return Number((totalFixedCosts / totalMaterialsCost * 100).toFixed(2));
}

// Calculate total cost of materials recursively (for nested recipes)
function calculateMaterialsCost(
  material: RecipeMaterial,
  products: Product[],
  recipes: Recipe[]
): number {
  if (material.type === 'product') {
    const product = products.find(p => p.id === material.id);
    if (!product) return 0;
    return material.quantity * (product.pricePerUnit || 0);
  } else {
    const recipe = recipes.find(r => r.id === material.id);
    if (!recipe) return 0;
    return material.quantity * recipe.unitCost;
  }
}

export function calculateRecipeCosts(
  materials: RecipeMaterial[],
  products: Product[],
  recipes: Recipe[],
  yield_: number,
  fixedCostPercentage: number,
  profitPercentage: number,
  previousUnitCost?: number
): RecipeCosts {
  // Calculate total materials cost including nested recipes
  const materialsCost = materials.reduce((sum, material) => 
    sum + calculateMaterialsCost(material, products, recipes), 
    0
  );

  // Calculate fixed costs
  const fixedCosts = (materialsCost * fixedCostPercentage) / 100;

  // Calculate total cost
  const totalCost = Number((materialsCost + fixedCosts).toFixed(2));

  // Calculate unit cost
  const unitCost = yield_ > 0 ? Number((totalCost / yield_).toFixed(2)) : 0;

  // Calculate suggested price using the formula:
  // suggestedPrice = unitCost / (1 - profitPercentage/100)
  const profitDecimal = profitPercentage / 100;
  const suggestedPrice = profitDecimal < 1 
    ? Number((unitCost / (1 - profitDecimal)).toFixed(2))
    : Number((unitCost * 2).toFixed(2));

  // Calculate cost history if there's a previous cost
  let costHistory;
  if (previousUnitCost && Math.abs(unitCost - previousUnitCost) > 0.01) {
    costHistory = [{
      date: Date.now(),
      unitCost,
      changePercentage: Number(((unitCost - previousUnitCost) / previousUnitCost * 100).toFixed(2))
    }];
  }

  return {
    totalCost,
    unitCost,
    suggestedPrice,
    costHistory
  };
}

// Function to update costs of dependent recipes
export function updateDependentRecipes(
  recipes: Recipe[],
  products: Product[],
  updatedRecipeId: string,
  visited = new Set<string>()
): Recipe[] {
  // Prevent infinite recursion
  if (visited.has(updatedRecipeId)) {
    return recipes;
  }
  visited.add(updatedRecipeId);

  // Find recipes that use the updated recipe as a material
  const dependentRecipes = recipes.filter(recipe =>
    recipe.materials.some(m => m.type === 'recipe' && m.id === updatedRecipeId)
  );

  // Update each dependent recipe
  let updatedRecipes = [...recipes];
  for (const recipe of dependentRecipes) {
    // Recalculate costs
    const costs = calculateRecipeCosts(
      recipe.materials,
      products,
      updatedRecipes, // Use current state of recipes
      recipe.yield,
      recipe.fixedCostPercentage,
      recipe.profitPercentage,
      recipe.unitCost
    );

    // Update recipe with new costs
    const recipeIndex = updatedRecipes.findIndex(r => r.id === recipe.id);
    if (recipeIndex !== -1) {
      const costHistory = recipe.costHistory || [];
      if (costs.costHistory?.[0]) {
        costHistory.push(costs.costHistory[0]);
      }

      updatedRecipes[recipeIndex] = {
        ...recipe,
        totalCost: costs.totalCost,
        unitCost: costs.unitCost,
        suggestedPrice: costs.suggestedPrice,
        costHistory,
        lastUpdated: Date.now()
      };

      // Recursively update recipes that depend on this one
      updatedRecipes = updateDependentRecipes(
        updatedRecipes,
        products,
        recipe.id!,
        visited
      );
    }
  }

  return updatedRecipes;
}
export interface Recipe {
  id?: string;
  name: string;
  yield: number;
  yieldUnit: string;
  materials: RecipeMaterial[];
  fixedCostPercentage: number;
  profitPercentage: number;
  notes?: string;
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  lastUpdated: number;
}

export interface RecipeMaterial {
  productId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}
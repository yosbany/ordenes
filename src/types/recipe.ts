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
  costHistory?: CostHistoryEntry[];
  costThreshold?: number;
  isBase?: boolean; // Flag to mark base recipes
}

export interface RecipeMaterial {
  id: string;
  type: 'product' | 'recipe'; // Type of material
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface CostHistoryEntry {
  date: number;
  unitCost: number;
  changePercentage: number;
}

export interface MonthlyFixedCosts {
  id?: string;
  month: number; // 1-12
  year: number;
  totalMaterialsCost: number;
  totalFixedCosts: number;
  totalSales: number;
  productionSales: number;
  fixedCostPercentage: number;
  lastUpdated: number;
}

export interface FixedCostsHistory {
  date: number;
  totalMaterialsCost: number;
  totalFixedCosts: number;
  fixedCostPercentage: number;
}
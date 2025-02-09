// Update Product interface to include enabled state
export interface Product {
  id?: string;
  name: string;
  sku: string;
  supplierCode?: string;
  purchasePackaging: string;
  salePackaging: string;
  order: number;
  price: number;
  desiredStock: number;
  minPackageStock: number;
  providerId: string;
  tags: string[];
  isProduction: boolean;
  unitMeasure?: string;
  pricePerUnit?: number;
  stockAdjustments?: StockAdjustment[];
  lastStockCheck?: number;
  forSale?: boolean;
  saleUnit?: string;
  salePrice?: number;
  saleCostPerUnit?: number;
  priceHistory?: PriceHistoryEntry[];
  salePriceHistory?: PriceHistoryEntry[];
  priceThreshold?: number;
  enabled: boolean; // New field
  lastUpdated?: number;
}
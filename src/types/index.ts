import { WeekDay } from './weekDay';

export interface Provider {
  id?: string;
  commercialName: string;
  legalName?: string;
  rut?: string;
  phone?: string;
  deliveryDays?: WeekDay[];
  orderDays?: WeekDay[];
  billingType?: 'weekly' | 'monthly';
  billingDays?: number[]; // For monthly billing, days of the month (1-31)
}

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
  priceHistory?: PriceHistoryEntry[];
  salePriceHistory?: PriceHistoryEntry[];
  priceThreshold?: number; // Percentage threshold for significant price changes
}

export interface PriceHistoryEntry {
  date: number;
  price: number;
  changePercentage: number;
}

export interface StockAdjustment {
  date: number;
  quantity: number; // Positive for overages, negative for shortages
  notes?: string;
}

export interface Order {
  id?: string;
  providerId: string;
  date: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'completed';

export interface UnitConversion {
  id?: string;
  fromUnit: string;
  toUnit: string;
  factor: number;
  createdAt: number;
  updatedAt: number;
}
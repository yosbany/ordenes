export interface Provider {
  id?: string;
  commercialName: string;
  legalName?: string;
  rut?: string;
  phone?: string;
  deliveryDays?: string[];
  orderDays?: string[];
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
  currentStock?: number;
  lastStockCheck?: number;
}

export interface Order {
  id?: string;
  providerId: string;
  date: number;
  status: 'pending' | 'completed';
  items: OrderItem[];
  total: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
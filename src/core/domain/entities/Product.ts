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
}
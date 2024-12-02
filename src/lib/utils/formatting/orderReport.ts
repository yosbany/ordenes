import { Order, Product } from '@/types';
import { formatReport } from './reportUtils';

export function formatOrderReport(
  order: Order,
  products: Product[],
  provider: { commercialName: string; legalName?: string }
): string {
  return formatReport(order, products, false);
}
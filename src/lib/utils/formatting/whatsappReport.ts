import { Order, Product } from '@/types';
import { formatReport } from './reportUtils';

export function formatWhatsAppReport(
  order: Order,
  products: Product[],
  provider: { commercialName: string; legalName?: string }
): string {
  return formatReport(order, products, true);
}
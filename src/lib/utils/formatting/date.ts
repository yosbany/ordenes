import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order, Product } from '@/types';

/**
 * Formats an order message with date and items
 */
export function formatOrderMessage(
  order: Order, 
  products: Product[], 
  providerName: string, 
  providerLegalName?: string
): string {
  const date = format(new Date(order.date), "dd/MM/yyyy HH:mm:ss", { locale: es });
  
  const header = [
    `Pedido: ${date}`,
    providerName,
    providerLegalName && providerLegalName !== providerName ? providerLegalName : '',
    '________________________________'
  ].filter(Boolean).join('\n');

  const items = order.items
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      const skuPart = product.sku ? `[${product.sku}] ` : '';
      return `• *${item.quantity} ${product.purchasePackaging}* - ${skuPart}${product.name}`;
    })
    .filter(Boolean)
    .join('\n');

  return `${header}\n\n${items}`;
}
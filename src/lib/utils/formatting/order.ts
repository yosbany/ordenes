import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order, Product } from '@/types';

export function formatOrderMessage(
  order: Order, 
  products: Product[], 
  providerName: string, 
  providerLegalName?: string
): string {
  const date = format(new Date(order.date), "dd/MM/yyyy HH:mm:ss", { locale: es });
  
  // Format header with provider names
  const header = [
    `Pedido: ${date}`,
    providerName,
    providerLegalName && providerLegalName !== providerName ? providerLegalName : '',
    '________________________________'
  ].filter(Boolean).join('\n');

  // Sort items by product order
  const sortedItems = [...order.items].sort((a, b) => {
    const productA = products.find(p => p.id === a.productId);
    const productB = products.find(p => p.id === b.productId);
    if (!productA || !productB) return 0;
    return productA.order - productB.order;
  });

  // Format items - only show product name and quantity
  const items = sortedItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return `${product.name}: ${item.quantity} ${product.purchasePackaging}`;
    })
    .filter(Boolean)
    .join('\n');

  // Add total count of products
  const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const footer = `\n________________________________\nTotal productos: ${totalProducts}`;

  return `${header}\n\n${items}${footer}`;
}
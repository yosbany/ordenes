import { Order, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTimestamp } from '@/lib/dateUtils';

// 80mm thermal printer settings
const PRINT_WIDTH = 48;

function formatHeader(date: number): string[] {
  const dateStr = format(fromTimestamp(date), "dd/MM/yyyy HH:mm", { locale: es });
  return [
    BUSINESS_INFO.name,
    BUSINESS_INFO.owner,
    `Pedido Fecha: ${dateStr}`,
    ''
  ];
}

function formatProductLine(quantity: number, packaging: string, name: string): string {
  const qtyCol = `${quantity} ${packaging}`.padEnd(15);
  return `${qtyCol}${name}`;
}

function formatProducts(products: Product[], items: Order['items']): string[] {
  // Sort items by product order
  return items
    .sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      if (!productA || !productB) return 0;
      return productA.order - productB.order;
    })
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return formatProductLine(item.quantity, product.purchasePackaging, product.name);
    })
    .filter((line): line is string => line !== null);
}

function formatSummary(items: Order['items']): string[] {
  // Calculate totals
  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return [
    '',
    '--------------------------------',
    `Total Items: ${totalItems}`,
    `Total Unidades: ${totalUnits}`,
    ''
  ];
}

export function formatReport(order: Order, products: Product[], isWhatsApp: boolean = false): string {
  if (isWhatsApp) {
    const header = [
      `Pedido Fecha: ${format(fromTimestamp(order.date), "dd/MM/yyyy HH:mm", { locale: es })}`,
      BUSINESS_INFO.name,
      BUSINESS_INFO.owner,
      ''
    ];

    const items = order.items
      .sort((a, b) => {
        const productA = products.find(p => p.id === a.productId);
        const productB = products.find(p => p.id === b.productId);
        if (!productA || !productB) return 0;
        return productA.order - productB.order;
      })
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return `• *${item.quantity} ${product.purchasePackaging}* - ${product.name}`;
      })
      .filter(Boolean);

    // Calculate totals
    const totalItems = order.items.length;
    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const summary = [
      '',
      '--------------------------------',
      `Total Items: ${totalItems}`,
      `Total Unidades: ${totalUnits}`
    ];

    return [...header, ...items, ...summary].join('\n');
  }

  // Thermal printer format
  const header = formatHeader(order.date);
  const formattedProducts = formatProducts(products, order.items);
  const summary = formatSummary(order.items);

  // Combine all sections with proper spacing
  return [
    ...header,
    ...formattedProducts,
    ...summary
  ].join('\n');
}
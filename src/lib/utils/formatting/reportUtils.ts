import { Order, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTimestamp } from '@/lib/dateUtils';

// 80mm thermal printer typically fits 32 characters at font-size 12pt
const PRINT_WIDTH = 32;
const SEPARATOR = '________________________________';
const NAME_WIDTH = Math.floor(PRINT_WIDTH * 0.75); // 75% for name
const QUANTITY_WIDTH = PRINT_WIDTH - NAME_WIDTH - 3; // Rest for quantity, -3 for bullet and spacing

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

export function formatHeader(date: number): string[] {
  return [
    `Pedido: ${format(fromTimestamp(date), "dd/MM/yyyy HH:mm:ss", { locale: es })}`,
    BUSINESS_INFO.name,
    BUSINESS_INFO.owner,
    SEPARATOR,
    '' // Add extra blank line before products
  ];
}

export function formatProductLines(products: Product[], items: Order['items']): string[] {
  const sortedItems = [...items].sort((a, b) => {
    const productA = products.find(p => p.id === a.productId);
    const productB = products.find(p => p.id === b.productId);
    if (!productA || !productB) return 0;
    return productA.order - productB.order;
  });

  const formattedLines: string[] = [];

  sortedItems.forEach((item, index) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    // Add extra spacing between products (except before first product)
    if (index > 0) {
      formattedLines.push('');
    }

    const quantity = `${item.quantity} ${product.purchasePackaging}`;
    const nameLines = wrapText(product.name, NAME_WIDTH - 2); // -2 for bullet point
    
    if (nameLines.length === 1) {
      // Single line: quantity on same line
      formattedLines.push(`• ${nameLines[0].padEnd(NAME_WIDTH - 2)} ${quantity.padStart(QUANTITY_WIDTH)}`);
    } else {
      // Multiple lines: quantity on last line
      formattedLines.push(`• ${nameLines[0]}`);
      for (let i = 1; i < nameLines.length - 1; i++) {
        formattedLines.push(`  ${nameLines[i]}`);
      }
      // Last line with quantity
      const lastLine = nameLines[nameLines.length - 1];
      formattedLines.push(`  ${lastLine.padEnd(NAME_WIDTH - 2)} ${quantity.padStart(QUANTITY_WIDTH)}`);
    }
  });

  return formattedLines;
}

export function formatFooter(items: Order['items']): string[] {
  return [
    '',
    SEPARATOR
  ];
}

export function formatReport(order: Order, products: Product[], isWhatsApp: boolean = false): string {
  const header = formatHeader(order.date);
  const productLines = formatProductLines(products, order.items);
  const footer = formatFooter(order.items);

  if (isWhatsApp) {
    const sortedItems = [...order.items].sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      if (!productA || !productB) return 0;
      return productA.order - productB.order;
    });

    const formattedProducts = sortedItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return `• *${item.quantity} ${product.purchasePackaging}* - ${product.name}`;
    }).filter(Boolean);

    return [
      ...header,
      '',
      ...formattedProducts,
      ''
    ].join('\n');
  }

  return [...header, ...productLines, ...footer].join('\n');
}
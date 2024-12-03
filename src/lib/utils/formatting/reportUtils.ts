import { Order, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// 80mm thermal printer typically fits 32 characters at font-size 12pt
const PRINT_WIDTH = 32;

export interface FormattedLine {
  content: string;
  prefix?: string;
  suffix?: string;
}

export function formatHeader(date: string): string {
  return [
    `Pedido: ${format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: es })}`,
    BUSINESS_INFO.name,
    BUSINESS_INFO.owner,
    '________________________________',
    '', // Add extra blank line before products
  ].join('\n');
}

export function formatProductLines(
  products: Product[],
  items: Order['items'],
  isWhatsApp: boolean = false
): FormattedLine[] {
  // Sort items by product order
  const sortedItems = [...items].sort((a, b) => {
    const productA = products.find(p => p.id === a.productId);
    const productB = products.find(p => p.id === b.productId);
    if (!productA || !productB) return 0;
    return productA.order - productB.order;
  });

  // For WhatsApp, find the longest quantity + packaging combination
  let maxPrefixLength = 0;
  if (isWhatsApp) {
    maxPrefixLength = sortedItems.reduce((max, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return max;
      const prefixLength = `${item.quantity} ${product.purchasePackaging}`.length;
      return Math.max(max, prefixLength);
    }, 0);
  }

  return sortedItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return { content: '' };

    if (isWhatsApp) {
      // For WhatsApp: bullet point + padded quantity + packaging - product name
      const quantityPackaging = `${item.quantity} ${product.purchasePackaging}`;
      const padding = ' '.repeat(maxPrefixLength - quantityPackaging.length);
      const prefix = `• *${quantityPackaging}*${padding} - `;
      return {
        content: product.name,
        prefix
      };
    } else {
      // For print: product name and quantity as separate columns
      return {
        content: product.name,
        suffix: `${item.quantity} ${product.purchasePackaging}`
      };
    }
  }).filter(line => line.content);
}

export function formatTableRows(lines: FormattedLine[]): string[] {
  if (!lines.length) return [];

  // Calculate column widths
  const contentWidth = Math.floor(PRINT_WIDTH * 0.6); // 60% for product name
  const quantityWidth = PRINT_WIDTH - contentWidth - 1; // Rest for quantity, -1 for spacing

  return lines.map(line => {
    // Truncate and pad content
    let content = line.content;
    if (content.length > contentWidth) {
      content = content.slice(0, contentWidth - 3) + '...';
    } else {
      content = content.padEnd(contentWidth);
    }

    // Pad quantity to align right
    const quantity = line.suffix || '';
    const paddedQuantity = quantity.padStart(quantityWidth);

    return `${content} ${paddedQuantity}`;
  });
}

export function formatReport(
  order: Order,
  products: Product[],
  isWhatsApp: boolean = false
): string {
  const header = formatHeader(order.date);
  const formattedLines = formatProductLines(products, order.items, isWhatsApp);

  if (isWhatsApp) {
    // WhatsApp format with bullet points and aligned descriptions
    const alignedItems = formattedLines.map(line => 
      `${line.prefix || ''}${line.content}`
    );
    return `${header}${alignedItems.join('\n')}`;
  } else {
    // Print format with table layout
    const tableRows = formatTableRows(formattedLines);
    return `${header}${tableRows.join('\n')}`;
  }
}
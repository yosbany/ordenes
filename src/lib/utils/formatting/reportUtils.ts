import { Order, Product } from '@/types';
import { BUSINESS_INFO, SECTORS } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTimestamp } from '@/lib/dateUtils';
import { formatPrice } from './currency';
import { getSectorFromOrder } from '@/lib/order/utils';

// 80mm thermal printer settings (at standard font size)
const PRINT_WIDTH = 48; // Characters per line for thermal printer

function centerText(text: string, width: number = PRINT_WIDTH): string {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  return ' '.repeat(leftPad) + text;
}

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

function formatHeader(date: number): string[] {
  const dateStr = format(fromTimestamp(date), "dd/MM/yyyy HH:mm", { locale: es });
  return [
    `Pedido Fecha: ${dateStr}`,
    BUSINESS_INFO.name,
    BUSINESS_INFO.owner,
    ''
  ];
}

function formatProductLine(name: string, quantity: number, packaging: string): string[] {
  const lines: string[] = [];
  const quantityText = `${quantity} ${packaging}`;
  const maxNameWidth = PRINT_WIDTH - quantityText.length - 3; // -3 for ". " prefix and space before quantity
  
  // Wrap product name if needed
  const nameLines = wrapText(name, maxNameWidth);
  
  // First line with right-aligned quantity
  lines.push(
    `. ${nameLines[0].padEnd(maxNameWidth)}${quantityText}`
  );
  
  // Additional name lines if any, properly indented
  for (let i = 1; i < nameLines.length; i++) {
    lines.push(`  ${nameLines[i]}`);
  }
  
  return lines;
}

function formatProductsBySection(productList: Product[], items: Order['items']): string[] {
  const lines: string[] = [];
  let currentSection = '';

  // Sort items by product order
  const sortedItems = [...items].sort((a, b) => {
    const productA = productList.find(p => p.id === a.productId);
    const productB = productList.find(p => p.id === b.productId);
    if (!productA || !productB) return 0;
    return productA.order - productB.order;
  });

  // Group and format items by section
  sortedItems.forEach(item => {
    const product = productList.find(p => p.id === item.productId);
    if (!product) return;

    const sectorCode = getSectorFromOrder(product.order);
    
    // Add section header if changed and it's not the General sector
    if (sectorCode !== currentSection && sectorCode !== 'GRL') {
      if (currentSection) {
        lines.push('');
      }
      currentSection = sectorCode;
      const sector = SECTORS.find(s => s.code === sectorCode);
      if (sector) {
        lines.push(centerText(sector.name));
        lines.push('');
      }
    } else if (sectorCode !== currentSection) {
      currentSection = sectorCode;
    }

    // Add product lines
    const productLines = formatProductLine(
      product.name,
      item.quantity,
      product.purchasePackaging
    );
    lines.push(...productLines);
  });

  return lines;
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

    return [...header, ...items, ''].join('\n');
  }

  // Thermal printer format
  const header = formatHeader(order.date);
  const formattedProducts = formatProductsBySection(products, order.items);

  return [
    ...header,
    ...formattedProducts,
    ''
  ].join('\n');
}
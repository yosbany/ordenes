import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order, Product } from '@/types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU'
  }).format(price);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('598') ? cleaned.slice(3) : cleaned;
  
  if (number.length >= 8) {
    const parts = [
      number.slice(0, 2),
      number.slice(2, 5),
      number.slice(5)
    ];
    return `+598 ${parts.join(' ')}`;
  }
  
  return `+598 ${number}`;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('598') ? cleaned.slice(3) : cleaned;
  return /^[0-9]{8,9}$/.test(number);
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('598') ? cleaned : `598${cleaned}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatOrderMessage(order: Order, products: Product[], providerName: string, providerLegalName?: string): string {
  const date = format(new Date(order.date), "dd/MM/yyyy HH:mm:ss", { locale: es });
  
  // Format header with provider names
  const header = [
    `Pedido: ${date}`,
    providerName,
    providerLegalName && providerLegalName !== providerName ? providerLegalName : '',
    '________________________________'
  ].filter(Boolean).join('\n');

  // Format items
  const items = order.items
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      const skuPart = product.sku ? `[${product.sku}] ` : '';
      return `. ${item.quantity} ${product.purchasePackaging} - ${skuPart}${product.name}`;
    })
    .filter(Boolean)
    .join('\n');

  return `${header}\n${items}`;
}
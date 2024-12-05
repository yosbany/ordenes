/**
 * Formats a number as Uruguayan currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU'
  }).format(price);
}
/**
 * Formats a number as currency without the currency symbol
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Formats a number as currency with the currency symbol
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU'
  }).format(price);
}
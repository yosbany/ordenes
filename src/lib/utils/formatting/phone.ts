/**
 * Formats a phone number to Uruguayan format
 */
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

/**
 * Validates if a phone number is a valid Uruguayan number
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('598') ? cleaned.slice(3) : cleaned;
  return /^[0-9]{8,9}$/.test(number);
}

/**
 * Generates a WhatsApp link for a given phone number and message
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('598') ? cleaned : `598${cleaned}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence
 */
export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { SECTORS } from '@/config/constants';

export const MIN_SEQUENCE = 1;
export const MAX_SEQUENCE = 999;
export const DEFAULT_SECTOR = SECTORS[0].code;

export const ORDER_VALIDATION_MESSAGES = {
  INVALID_SECTOR: 'Sector inválido',
  INVALID_SEQUENCE: 'Secuencia inválida',
  DUPLICATE_ORDER: 'Ya existe un producto en esta posición',
  OUT_OF_RANGE: 'Número de orden fuera de rango',
  SEQUENCE_GAP: 'La secuencia debe ser consecutiva'
} as const;
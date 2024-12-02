import { SECTORS } from '@/config/constants';

export type SectorColor = {
  bg: string;
  border: string;
  text: string;
};

export const SECTOR_COLORS: Record<string, SectorColor> = {
  GRL: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-800' },
  GFR: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800' },
  GRE: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800' },
  GTM: { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-800' },
  GPA: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-800' },
  GSC: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' },
  HEL: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  REF: { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-800' },
  CON: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
  FRU: { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-800' },
};

export function getSectorColor(sectorCode: string): SectorColor {
  return SECTOR_COLORS[sectorCode] || SECTOR_COLORS.GRL;
}
export interface Provider {
  id?: string;
  commercialName: string;
  legalName?: string;
  rut?: string;
  phone?: string;
  deliveryDays?: WeekDay[];
  orderDays?: WeekDay[];
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
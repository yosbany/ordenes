export type Sector = {
  code: string;
  name: string;
};

export const SECTORS: Sector[] = [
  { code: 'GRL', name: 'General' },
  { code: 'GFR', name: 'Granja Fresco' },
  { code: 'GRE', name: 'Granja Refrigerado' },
  { code: 'GTM', name: 'Granja Terminado' },
  { code: 'GPA', name: 'Granja Panadería' },
  { code: 'GSC', name: 'Granja Seco' },
  { code: 'HEL', name: 'Heladería' },
  { code: 'REF', name: 'Refrigerado' },
  { code: 'CON', name: 'Congelado' },
  { code: 'FRU', name: 'Frutas' }
];


export const BUSINESS_INFO = {
  name: 'Panadería Nueva Río D\'or',
  owner: 'TEJAS DE LA CRUZ YOSBANY'
} as const;
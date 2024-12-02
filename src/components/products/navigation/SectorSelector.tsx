import React from 'react';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { getSectorFromOrder } from '@/lib/utils';

interface SectorSelectorProps {
  products: Product[];
  currentProduct: Product | null;
  onSectorChange: (sectorCode: string) => void;
}

export function SectorSelector({
  products,
  currentProduct,
  onSectorChange,
}: SectorSelectorProps) {
  const currentSector = currentProduct 
    ? getSectorFromOrder(currentProduct.order)
    : SECTORS[0].code;

  return (
    <div className="flex items-center space-x-4">
      {SECTORS.map(sector => {
        const sectorProducts = products.filter(
          p => getSectorFromOrder(p.order) === sector.code
        );
        const isActive = sector.code === currentSector;

        return (
          <button
            key={sector.code}
            onClick={() => onSectorChange(sector.code)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {sector.name}
            <span className="ml-2 text-xs text-gray-500">
              ({sectorProducts.length})
            </span>
          </button>
        );
      })}
    </div>
  );
}
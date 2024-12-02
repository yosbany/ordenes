import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/order/utils';

interface OrderSelectorProps {
  product: Product;
  products: Product[];
  onChange: (order: number) => void;
}

export function OrderSelector({ product, products, onChange }: OrderSelectorProps) {
  const currentSector = getSectorFromOrder(product.order);
  const currentSequence = getSequenceFromOrder(product.order);
  
  // Get products in the same sector (excluding current product)
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === currentSector && p.id !== product.id)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));
  
  const maxPosition = sectorProducts.length + 1;

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSector = e.target.value;
    // When changing sectors, place at the end
    const newPosition = products
      .filter(p => getSectorFromOrder(p.order) === newSector && p.id !== product.id)
      .length + 1;
    
    const newOrder = calculateNewOrder(newSector, newPosition);
    onChange(newOrder);
  };

  const handleMove = (direction: 'prev' | 'next') => {
    const newPosition = direction === 'prev' 
      ? Math.max(1, currentSequence - 1)
      : Math.min(maxPosition, currentSequence + 1);

    if (newPosition !== currentSequence) {
      const newOrder = calculateNewOrder(currentSector, newPosition);
      onChange(newOrder);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        {/* Sector Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Sector
          </label>
          <select
            value={currentSector}
            onChange={handleSectorChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {SECTORS.map(sector => (
              <option key={sector.code} value={sector.code}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Posición
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove('prev')}
              disabled={currentSequence <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 text-center py-2 bg-gray-50 border rounded-md">
              {currentSequence} de {maxPosition}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove('next')}
              disabled={currentSequence >= maxPosition}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Current Product Preview */}
      <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
        <span className="block text-xs font-medium text-blue-600 mb-1">Actual</span>
        <span className="block text-sm font-medium text-gray-900 truncate">
          {product.name}
        </span>
      </div>
    </div>
  );
}
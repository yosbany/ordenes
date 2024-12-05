import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, getSectorProducts } from '@/lib/productOrder';

interface OrderControlsProps {
  product: Product;
  products: Product[];
  onOrderChange: (newOrder: number) => Promise<void>;
  disabled?: boolean;
}

export function OrderControls({ product, products, onOrderChange, disabled }: OrderControlsProps) {
  const currentSector = getSectorFromOrder(product.order);
  const sectorProducts = getSectorProducts(products, currentSector);
  const currentIndex = sectorProducts.findIndex(p => p.id === product.id);

  const handleMove = async (direction: 'prev' | 'next') => {
    if (disabled) return;

    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectorProducts.length) return;

    const targetProduct = sectorProducts[targetIndex];
    await onOrderChange(targetProduct.order);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleMove('prev')}
        disabled={disabled || currentIndex === 0}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="px-3 py-1 bg-gray-100 rounded text-sm">
        {SECTORS.find(s => s.code === currentSector)?.name} - 
        {getSequenceFromOrder(product.order).toString().padStart(3, '0')}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleMove('next')}
        disabled={disabled || currentIndex === sectorProducts.length - 1}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
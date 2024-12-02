import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { formatOrderNumber, getSequenceFromOrder, getSectorProducts } from '@/lib/utils';
import { ProductPreviewCard } from '@/components/products/ProductPreviewCard';

interface OrderSelectorProps {
  products: Product[];
  currentProduct: Product | null;
  onNavigate: (direction: 'prev' | 'next') => void;
  prevProduct: Product | null;
  nextProduct: Product | null;
  isProcessing: boolean;
  selectedSector: string;
}

export function OrderSelector({
  products,
  currentProduct,
  onNavigate,
  prevProduct,
  nextProduct,
  isProcessing,
  selectedSector
}: OrderSelectorProps) {
  const sectorProducts = getSectorProducts(products, selectedSector);
  const currentSequence = currentProduct ? getSequenceFromOrder(currentProduct.order) : 0;
  const maxSequence = sectorProducts.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {SECTORS.find(s => s.code === selectedSector)?.name}
        </div>
        <div className="text-sm text-gray-500">
          Posición {currentSequence} de {maxSequence}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Previous Product */}
        <div className="flex items-center">
          {prevProduct ? (
            <ProductPreviewCard
              product={prevProduct}
              label="Anterior"
              onClick={() => !isProcessing && onNavigate('prev')}
            />
          ) : (
            <div className="h-24 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg" />
          )}
        </div>

        {/* Current Product */}
        <div className="flex items-center">
          {currentProduct && (
            <div className="w-full border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <span className="block text-xs font-medium text-blue-600 mb-1">Actual</span>
              <span className="block text-sm font-medium text-gray-900 truncate mb-1">
                {currentProduct.name}
              </span>
              <span className="block text-xs text-gray-500">
                {formatOrderNumber(currentProduct.order)}
              </span>
            </div>
          )}
        </div>

        {/* Next Product */}
        <div className="flex items-center">
          {nextProduct ? (
            <ProductPreviewCard
              product={nextProduct}
              label="Siguiente"
              onClick={() => !isProcessing && onNavigate('next')}
            />
          ) : (
            <div className="h-24 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg" />
          )}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate('prev')}
          disabled={!prevProduct || isProcessing}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={!nextProduct || isProcessing}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
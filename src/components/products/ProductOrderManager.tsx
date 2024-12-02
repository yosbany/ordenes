import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SECTORS } from '@/config/constants';
import { formatOrderNumber } from '@/lib/utils';

interface ProductOrderManagerProps {
  product: Product;
  products: Product[];
  onOrderChange: (newOrder: number) => Promise<void>;
  disabled?: boolean;
}

export function ProductOrderManager({
  product,
  products,
  onOrderChange,
  disabled
}: ProductOrderManagerProps) {
  const sector = formatOrderNumber(product.order).split('-')[0];
  const sequence = parseInt(formatOrderNumber(product.order).split('-')[1]);
  
  const sectorProducts = products
    .filter(p => formatOrderNumber(p.order).split('-')[0] === sector)
    .sort((a, b) => a.order - b.order);

  const currentIndex = sectorProducts.findIndex(p => p.id === product.id);
  const maxSequence = sectorProducts.length;

  const handleMove = async (direction: 'prev' | 'next') => {
    if (disabled) return;

    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectorProducts.length) return;

    const targetProduct = sectorProducts[targetIndex];
    await onOrderChange(targetProduct.order);
  };

  return (
    <Card>
      <Card.Header>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <div className="text-lg font-medium text-gray-900">
              {SECTORS.find(s => s.code === sector)?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posición
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMove('prev')}
                disabled={disabled || currentIndex === 0}
                className={`
                  h-10 w-10 p-0 flex items-center justify-center
                  ${currentIndex === 0 || disabled
                    ? 'bg-gray-50 text-gray-400'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }
                `}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 h-10 rounded-lg border-2 border-gray-200 bg-gray-50 
                flex items-center justify-center font-mono text-gray-700"
              >
                {sequence} de {maxSequence}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMove('next')}
                disabled={disabled || currentIndex === maxSequence - 1}
                className={`
                  h-10 w-10 p-0 flex items-center justify-center
                  ${currentIndex === maxSequence - 1 || disabled
                    ? 'bg-gray-50 text-gray-400'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }
                `}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}
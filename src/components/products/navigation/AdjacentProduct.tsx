import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { formatOrderNumber } from '@/lib/utils';

interface AdjacentProductProps {
  product: Product;
  direction: 'prev' | 'next';
  onClick: () => void;
}

export function AdjacentProduct({ product, direction, onClick }: AdjacentProductProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left group bg-white rounded-lg border border-gray-200 p-4
        hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
        ${direction === 'prev' ? 'hover:translate-x-1' : 'hover:-translate-x-1'}
      `}
    >
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {direction === 'prev' ? (
          <>
            <ChevronLeft className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs">Anterior</span>
          </>
        ) : (
          <>
            <span className="text-xs">Siguiente</span>
            <ChevronRight className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
          </>
        )}
      </div>

      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
        {product.name}
      </h3>

      <div className="text-sm text-gray-500">
        {formatOrderNumber(product.order)}
      </div>
    </button>
  );
}
import React from 'react';
import { Product } from '@/types';
import { formatOrderNumber } from '@/lib/utils';

interface ProductPreviewCardProps {
  product: Product;
  label: string;
  onClick?: () => void;
}

export function ProductPreviewCard({ product, label, onClick }: ProductPreviewCardProps) {
  return (
    <div 
      className={`
        w-full p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 
        transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <span className="block text-sm font-medium text-gray-900 truncate mb-1">
        {product.name}
      </span>
      <span className="block text-xs text-gray-500">
        {formatOrderNumber(product.order)}
      </span>
    </div>
  );
}
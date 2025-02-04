import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ProductCarouselProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCarousel({ 
  products,
  onEdit,
  onDelete
}: ProductCarouselProps) {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Sort products by order
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  if (isLargeScreen) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
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

  // Calculate margins and sort products
  const sortedProducts = [...products].sort((a, b) => {
    // Calculate margins
    const getMargin = (product: Product) => {
      if (!product.forSale || !product.salePrice || !product.saleCostPerUnit) return null;
      return ((product.salePrice - product.saleCostPerUnit) / product.salePrice) * 100;
    };

    const marginA = getMargin(a);
    const marginB = getMargin(b);

    // If both products have margins, sort by margin status
    if (marginA !== null && marginB !== null) {
      // Helper function to get margin priority (red = 0, orange = 1, green = 2)
      const getMarginPriority = (margin: number) => {
        if (margin < 0) return 0; // Red
        if (margin <= 5) return 1; // Orange
        return 2; // Green
      };

      const priorityA = getMarginPriority(marginA);
      const priorityB = getMarginPriority(marginB);

      // Sort by priority first (lower priority = red comes first)
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort by margin value (ascending)
      return marginA - marginB;
    }

    // If only one product has a margin, put it first
    if (marginA !== null) return -1;
    if (marginB !== null) return 1;

    // If neither has a margin, sort by order
    return a.order - b.order;
  });

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
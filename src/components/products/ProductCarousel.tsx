import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ProductCarouselProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onOrderChange: (product: Product, newOrder: number) => Promise<void>;
  customRender?: (product: Product) => React.ReactNode;
}

export function ProductCarousel({ 
  products, 
  onEdit, 
  onDelete,
  onOrderChange,
  customRender 
}: ProductCarouselProps) {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Sort products by order
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  const renderProduct = (product: Product) => {
    if (customRender) {
      return customRender(product);
    }
    return (
      <ProductCard
        key={product.id}
        product={product}
        products={sortedProducts}
        onEdit={onEdit}
        onDelete={onDelete}
        onOrderChange={onOrderChange}
      />
    );
  };

  if (isLargeScreen) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {sortedProducts.map((product) => (
          <div key={product.id}>
            {renderProduct(product)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedProducts.map((product) => (
        <div key={product.id}>{renderProduct(product)}</div>
      ))}
    </div>
  );
}
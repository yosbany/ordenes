import React from 'react';
import { Product } from '@/types';
import { SectorSelector } from './SectorSelector';
import { NavigationControls } from './NavigationControls';
import { ProductCard } from './ProductCard';
import { AdjacentProduct } from './AdjacentProduct';

interface ProductNavigationProps {
  products: Product[];
  currentProduct: Product | null;
  onProductChange: (product: Product) => void;
  onSectorChange: (sectorCode: string) => void;
}

export function ProductNavigation({
  products,
  currentProduct,
  onProductChange,
  onSectorChange,
}: ProductNavigationProps) {
  const currentIndex = currentProduct 
    ? products.findIndex(p => p.id === currentProduct.id)
    : -1;

  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : null;
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <SectorSelector
          products={products}
          currentProduct={currentProduct}
          onSectorChange={onSectorChange}
        />
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        products={products}
        currentProduct={currentProduct}
        onProductChange={onProductChange}
      />

      {/* Product Display */}
      <div className="grid grid-cols-12 gap-4">
        {/* Previous Product */}
        <div className="col-span-2">
          {prevProduct && (
            <AdjacentProduct
              product={prevProduct}
              direction="prev"
              onClick={() => onProductChange(prevProduct)}
            />
          )}
        </div>

        {/* Current Product */}
        <div className="col-span-8">
          {currentProduct && (
            <ProductCard product={currentProduct} />
          )}
        </div>

        {/* Next Product */}
        <div className="col-span-2">
          {nextProduct && (
            <AdjacentProduct
              product={nextProduct}
              direction="next"
              onClick={() => onProductChange(nextProduct)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
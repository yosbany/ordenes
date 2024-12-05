import React from 'react';
import { Product } from '@/types';
import { OrderSelector } from './OrderSelector';
import { useOrderNavigation } from '@/hooks/useOrderNavigation';

interface OrderManagerProps {
  order: number;
  onChange: (order: number) => void;
  products: Product[];
  currentProduct: Product | null;
  onProductsReorder?: (products: Product[]) => Promise<void>;
}

export function OrderManager({
  order,
  onChange,
  products,
  currentProduct,
  onProductsReorder
}: OrderManagerProps) {
  const {
    selectedSector,
    handleSectorChange,
    handleNavigate,
    prevProduct,
    nextProduct,
    isProcessing
  } = useOrderNavigation({
    order,
    products,
    currentProduct,
    onOrderChange: onChange,
    onProductsReorder
  });

  return (
    <OrderSelector
      order={order}
      onChange={onChange}
      products={products}
      currentProduct={currentProduct}
      selectedSector={selectedSector}
      onSectorChange={handleSectorChange}
      onNavigate={handleNavigate}
      prevProduct={prevProduct}
      nextProduct={nextProduct}
      isProcessing={isProcessing}
    />
  );
}
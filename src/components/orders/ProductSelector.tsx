import React, { useState } from 'react';
import { Product } from '@/types';
import { OrderProductCard } from './OrderProductCard';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Map<string, number>;
  onProductSelect: (productId: string, quantity: number) => void;
  onProductUpdate?: (id: string, data: Partial<Product>) => Promise<void>;
}

export function ProductSelector({
  products,
  selectedProducts,
  onProductSelect,
  onProductUpdate
}: ProductSelectorProps) {
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  // Sort products by order
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      onProductSelect(productId, newQuantity);
      markAsReviewed(productId);
    }
  };

  const handleProductUpdate = async (product: Product, data: Partial<Product>) => {
    if (!onProductUpdate) return;
    await onProductUpdate(product.id!, data);
    markAsReviewed(product.id!);
  };

  const markAsReviewed = (productId: string) => {
    setReviewedProducts(prev => new Set(prev).add(productId));
  };

  return (
    <div className="space-y-3">
      {sortedProducts.map((product) => (
        <OrderProductCard
          key={product.id}
          product={product}
          products={products}
          isSelected={selectedProducts.has(product.id!)}
          quantity={selectedProducts.get(product.id!) || 0}
          onQuantityChange={(quantity) => handleQuantityChange(product.id!, quantity)}
          onProductUpdate={handleProductUpdate}
          onReview={() => markAsReviewed(product.id!)}
          isReviewed={reviewedProducts.has(product.id!)}
        />
      ))}
    </div>
  );
}
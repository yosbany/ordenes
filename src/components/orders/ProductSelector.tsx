import React, { useState } from 'react';
import { Product } from '@/types';
import { OrderProductCard } from './OrderProductCard';
import { ProductFilter } from './ProductFilter';
import { Button } from '@/components/ui/Button';
import { Filter } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Map<string, number>;
  onProductSelect: (productId: string, quantity: number) => void;
  allowEdit?: boolean;
  onReorder?: (products: Product[]) => void;
}

export function ProductSelector({
  products,
  selectedProducts,
  onProductSelect,
  allowEdit = true,
  onReorder
}: ProductSelectorProps) {
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
  const [filterValue, setFilterValue] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [draggingProduct, setDraggingProduct] = useState<string | null>(null);
  const dragControls = useDragControls();

  // Filter out disabled products first, then sort by order
  const sortedProducts = [...products]
    .filter(product => product.enabled !== false) // Only show enabled products
    .sort((a, b) => a.order - b.order);

  // Filter products based on search term and selected filter
  const filteredProducts = sortedProducts.filter(product => {
    // First apply selected filter if active
    if (showOnlySelected && !selectedProducts.has(product.id!)) {
      return false;
    }

    // Then apply search filter if there's a search term
    if (filterValue.trim()) {
      const searchTerm = filterValue.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        (product.supplierCode?.toLowerCase().includes(searchTerm)) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return true;
  });

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      onProductSelect(productId, newQuantity);
      markAsReviewed(productId);
    }
  };

  const markAsReviewed = (productId: string) => {
    setReviewedProducts(prev => new Set(prev).add(productId));
  };

  const handleReorder = (reorderedProducts: Product[]) => {
    if (onReorder) {
      onReorder(reorderedProducts);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1">
          <ProductFilter 
            value={filterValue}
            onChange={setFilterValue}
            placeholder="Filtrar"
          />
        </div>
        <Button
          variant={showOnlySelected ? "primary" : "outline"}
          onClick={() => setShowOnlySelected(!showOnlySelected)}
          className="w-10 h-10 p-0 flex items-center justify-center"
          title={showOnlySelected ? 'Mostrar todos' : 'Solo seleccionados'}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Products List */}
      <Reorder.Group
        axis="y"
        values={filteredProducts}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {filteredProducts.map((product) => (
          <Reorder.Item
            key={product.id}
            value={product}
            dragListener={false}
            dragControls={dragControls}
            onDragStart={() => setDraggingProduct(product.id)}
            onDragEnd={() => setDraggingProduct(null)}
          >
            <OrderProductCard
              product={product}
              quantity={selectedProducts.get(product.id!) || 0}
              onQuantityChange={(quantity) => handleQuantityChange(product.id!, quantity)}
              onReview={() => markAsReviewed(product.id!)}
              isReviewed={reviewedProducts.has(product.id!)}
              allowEdit={allowEdit}
              onDragHandleHold={() => dragControls.start(product.id!)}
              isDragging={draggingProduct === product.id}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {showOnlySelected 
            ? 'No hay productos seleccionados'
            : 'No se encontraron productos que coincidan con la búsqueda'
          }
        </div>
      )}
    </div>
  );
}
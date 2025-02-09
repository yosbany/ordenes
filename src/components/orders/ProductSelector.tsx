import React, { useState, useRef } from 'react';
import { Product } from '@/types';
import { OrderProductCard } from './OrderProductCard';
import { ProductFilter } from './ProductFilter';
import { Button } from '@/components/ui/Button';
import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProductOrder } from '@/lib/services/database/productOrder';
import { toast } from 'react-hot-toast';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Map<string, number>;
  onProductSelect: (productId: string, quantity: number) => void;
  allowEdit?: boolean;
}

export function ProductSelector({
  products,
  selectedProducts,
  onProductSelect,
  allowEdit = true
}: ProductSelectorProps) {
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
  const [filterValue, setFilterValue] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleDragStart = (productId: string) => {
    setDraggedProduct(productId);
  };

  const handleDragEnd = async (productId: string, info: any) => {
    setDraggedProduct(null);

    if (!containerRef.current) return;

    const draggedProduct = products.find(p => p.id === productId);
    if (!draggedProduct) return;

    // Get all product cards
    const cards = Array.from(containerRef.current.children);
    const draggedIndex = cards.findIndex(card => card.getAttribute('data-product-id') === productId);
    
    // Calculate drop position
    const cardHeight = cards[draggedIndex].getBoundingClientRect().height;
    const dropIndex = Math.round((draggedIndex * cardHeight + info.offset.y) / cardHeight);
    
    // Ensure drop index is within bounds
    const finalIndex = Math.max(0, Math.min(dropIndex, cards.length - 1));
    
    if (draggedIndex === finalIndex) return;

    try {
      // Get target product's order
      const targetProduct = products[finalIndex];
      if (!targetProduct) return;

      // Update the product's order
      await updateProductOrder(productId, targetProduct.order);
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
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
      <div ref={containerRef} className="space-y-3">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <div key={product.id} data-product-id={product.id}>
              <OrderProductCard
                product={product}
                quantity={selectedProducts.get(product.id!) || 0}
                onQuantityChange={(quantity) => handleQuantityChange(product.id!, quantity)}
                onReview={() => markAsReviewed(product.id!)}
                isReviewed={reviewedProducts.has(product.id!)}
                allowEdit={allowEdit}
                onDragStart={() => handleDragStart(product.id!)}
                onDragEnd={(_, info) => handleDragEnd(product.id!, info)}
                isDragging={draggedProduct === product.id}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

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
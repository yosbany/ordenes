import React, { useState } from 'react';
import { Package, Archive, Check, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { formatPrice, formatOrderNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ProductForm } from '@/components/products/ProductForm';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (product: Product, data: Omit<Product, 'id'>) => Promise<void>;
  providerId: string;
}

export function ProductCard({
  product,
  isSelected,
  onSelect,
  onUpdate,
  providerId
}: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardClick = () => {
    if (!isReviewed) {
      setIsReviewed(true);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(!isSelected);
    if (!isReviewed) {
      setIsReviewed(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    if (!isReviewed) {
      setIsReviewed(true);
    }
  };

  const handleUpdate = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      await onUpdate(product, data);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          relative bg-white rounded-lg border transition-all duration-200
          ${isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}
        `}
        onClick={handleCardClick}
      >
        {/* Review Indicator */}
        <AnimatePresence>
          {isReviewed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded border cursor-pointer transition-colors
                ${isSelected 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300 hover:border-blue-500'
                }
              `}
              onClick={handleCheckboxClick}
            >
              {isSelected && (
                <Check className="w-full h-full text-white p-0.5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 
                  className="text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                  onClick={handleEditClick}
                >
                  {product.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </Button>
              </div>

              <div className="mt-1 text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{product.packaging}</span>
            </div>
            <div className="flex items-center">
              <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
            </div>
            <div className="col-span-2 text-gray-500 text-xs">
              {formatOrderNumber(product.order)}
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Editar Producto"
      >
        <ProductForm
          providerId={providerId}
          initialData={product}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      </Dialog>
    </>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Archive, Check, Plus, Minus, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatting/currency';
import { formatOrderNumber } from '@/lib/order/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FullscreenProductEditor } from '@/components/products/FullscreenProductEditor';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';

interface OrderProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onReview: () => void;
  isReviewed: boolean;
  allowEdit?: boolean;
  onDragHandleHold?: () => void;
  isDragging?: boolean;
}

export function OrderProductCard({
  product,
  quantity,
  onQuantityChange,
  onReview,
  isReviewed,
  allowEdit = true,
  onDragHandleHold,
  isDragging
}: OrderProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());
  const quantityControlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout>();
  const { products, updateProduct } = useGlobalProducts();
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Get latest product data
  const currentProduct = products.find(p => p.id === product.id) || product;

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quantityControlsRef.current && !quantityControlsRef.current.contains(event.target as Node)) {
        setShowQuantityInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showQuantityInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showQuantityInput]);

  const handleProductUpdate = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      await updateProduct(currentProduct.id!, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on buttons and inputs
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('.quantity-controls') ||
      (e.target as HTMLElement).closest('.drag-handle')
    ) {
      return;
    }

    // Handle single/double click
    if (clickTimeoutRef.current) {
      // Double click - toggle product selection
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = undefined;
      onQuantityChange(quantity > 0 ? 0 : currentProduct.desiredStock);
    } else {
      // Single click - mark as reviewed
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = undefined;
        if (!isReviewed) {
          onReview();
        }
      }, 250);
    }
  };

  const handleQuantityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuantityInput(true);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityChange(newQuantity);
      if (!isReviewed) {
        onReview();
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      handleQuantityChange(Math.max(0, quantity - 1));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      handleQuantityChange(numValue);
    }
  };

  return (
    <>
      <Card isSelected={quantity > 0}>
        <Card.Header className="!p-3">
          <motion.div 
            className="relative" 
            onClick={handleCardClick}
            animate={isDragging ? { scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" } : { scale: 1 }}
          >
            {/* Review Indicator */}
            {isReviewed && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded border cursor-pointer transition-colors mt-1
                  ${quantity > 0 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 hover:border-blue-500'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity > 0 ? 0 : currentProduct.desiredStock);
                }}
              >
                {quantity > 0 && (
                  <Check className="w-full h-full text-white p-0.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Product Name */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {currentProduct.name}
                  </h3>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div 
                    ref={dragHandleRef}
                    className="flex items-center gap-2 cursor-grab active:cursor-grabbing drag-handle"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onDragHandleHold?.();
                    }}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span>Orden: {formatOrderNumber(currentProduct.order)}</span>
                  </div>
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Stock: {currentProduct.minPackageStock} - {currentProduct.desiredStock}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                {quantity > 0 && (
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <div ref={quantityControlsRef} className="quantity-controls">
                        {showQuantityInput ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDecrement}
                              disabled={quantity <= 0}
                              className="w-12 h-12 rounded-full"
                            >
                              <Minus className="w-5 h-5" />
                            </Button>
                            
                            <Input
                              ref={inputRef}
                              type="number"
                              min="0"
                              step="0.01"
                              value={inputValue}
                              onChange={handleInputChange}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={currentProduct.desiredStock.toString()}
                              className="text-center text-lg h-12"
                            />
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleIncrement}
                              className="w-12 h-12 rounded-full"
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={handleQuantityClick}
                            className="w-full h-12 px-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <span className="text-lg font-medium">
                              {quantity} {currentProduct.purchasePackaging}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(currentProduct.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: {formatPrice(currentProduct.price * quantity)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price (when not selected) */}
                {!quantity && (
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(currentProduct.price)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Card.Header>
      </Card>

      {/* Product Edit Modal - Only show if editing is allowed */}
      {allowEdit && isEditing && (
        <FullscreenProductEditor
          providerId={currentProduct.providerId}
          product={currentProduct}
          onSubmit={handleProductUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
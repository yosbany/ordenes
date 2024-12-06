import React, { useState, useRef, useEffect } from 'react';
import { Archive, Check, Pencil, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatting/currency';
import { formatOrderNumber } from '@/lib/order/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FullscreenProductEditor } from '@/components/products/FullscreenProductEditor';

interface OrderProductCardProps {
  product: Product;
  products: Product[];
  isSelected: boolean;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onProductUpdate?: (product: Product, data: Partial<Product>) => Promise<void>;
  onReview: () => void;
  isReviewed: boolean;
}

export function OrderProductCard({
  product,
  products,
  isSelected,
  quantity,
  onQuantityChange,
  onProductUpdate,
  onReview,
  isReviewed
}: OrderProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());
  const quantityControlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when quantity prop changes
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // Handle clicks outside quantity controls to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quantityControlsRef.current && !quantityControlsRef.current.contains(event.target as Node)) {
        setShowQuantityInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when quantity controls are shown
  useEffect(() => {
    if (showQuantityInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showQuantityInput]);

  const handleProductUpdate = async (data: Omit<Product, 'id'>) => {
    if (!onProductUpdate) return;
    setIsSubmitting(true);
    try {
      await onProductUpdate(product, data);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on buttons, inputs, and quantity controls
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('.quantity-controls')
    ) {
      return;
    }

    // Mark as reviewed if not already
    if (!isReviewed) {
      onReview();
    }

    // Add product if not already selected
    if (!isSelected) {
      onQuantityChange(product.desiredStock);
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
      handleQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      handleQuantityChange(numValue);
    }
  };

  return (
    <>
      <Card isSelected={isSelected}>
        <Card.Header className="!p-3">
          <div className="relative" onClick={handleCardClick}>
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
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 hover:border-blue-500'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(isSelected ? 0 : product.desiredStock);
                }}
              >
                {isSelected && (
                  <Check className="w-full h-full text-white p-0.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Product Name */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ArrowUpDown className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Orden: {formatOrderNumber(product.order)}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                {isSelected && (
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
                              value={inputValue}
                              onChange={handleInputChange}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={product.desiredStock.toString()}
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
                              {quantity} {product.purchasePackaging}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ${formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: ${formatPrice(product.price * quantity)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price (when not selected) */}
                {!isSelected && (
                  <div className="text-lg font-bold text-blue-600">
                    ${formatPrice(product.price)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card.Header>
      </Card>

      {/* Product Edit Modal */}
      {isEditing && (
        <FullscreenProductEditor
          providerId={product.providerId}
          product={product}
          onSubmit={handleProductUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
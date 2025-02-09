import React, { useState, useRef, useEffect } from 'react';
import { Archive, Check, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { motion, useDragControls } from 'framer-motion';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatting/currency';
import { formatOrderNumber } from '@/lib/order/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface OrderProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onReview: () => void;
  isReviewed: boolean;
  allowEdit?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (e: any, info: any) => void;
  isDragging?: boolean;
}

export function OrderProductCard({
  product,
  quantity,
  onQuantityChange,
  onReview,
  isReviewed,
  allowEdit = true,
  onDragStart,
  onDragEnd,
  isDragging
}: OrderProductCardProps) {
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());
  const quantityControlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout>();
  const dragControls = useDragControls();

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

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('.quantity-controls')
    ) {
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = undefined;
      onQuantityChange(quantity > 0 ? 0 : product.desiredStock);
    } else {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
        zIndex: isDragging ? 1 : 0,
        boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.12)" : "none"
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="relative touch-none"
    >
      <Card isSelected={quantity > 0}>
        <Card.Header className="!p-3">
          <div className="relative" onClick={handleCardClick}>
            {isReviewed && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              <button
                className="flex-shrink-0 w-5 h-5 mt-1 cursor-move touch-none"
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragControls.start(e);
                  onDragStart?.();
                }}
              >
                <ArrowUpDown className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <ArrowUpDown className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Orden: {formatOrderNumber(product.order)}</span>
                  </div>
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
                  </div>
                </div>

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
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: {formatPrice(product.price * quantity)}
                      </div>
                    </div>
                  </div>
                )}

                {!quantity && (
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card.Header>
      </Card>
    </motion.div>
  );
}
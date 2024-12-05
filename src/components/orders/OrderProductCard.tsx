import React, { useState } from 'react';
import { Package, Archive, ArrowUpDown, Check, Pencil } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber, getSectorFromOrder } from '@/lib/order/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductOrderModal } from '@/components/products/ProductOrderModal';
import { FullscreenProductEditor } from '@/components/products/FullscreenProductEditor';
import { getSectorColor } from '@/lib/sectorColors';

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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectorColor = getSectorColor(getSectorFromOrder(product.order));

  const handleOrderChange = async (updatedProduct: Product, newOrder: number) => {
    if (!onProductUpdate) return;
    await onProductUpdate(updatedProduct, { order: newOrder });
  };

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

  return (
    <>
      <Card isSelected={isSelected}>
        <Card.Header className="!p-3">
          <div className="relative">
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
                onClick={() => onQuantityChange(isSelected ? 0 : product.desiredStock)}
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
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{product.purchasePackaging}</span>
                  </div>
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
                  </div>
                  <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className={`
                      inline-flex items-center px-2 py-1 rounded-md text-sm transition-colors
                      ${sectorColor.bg} ${sectorColor.border} ${sectorColor.text}
                      hover:opacity-90
                    `}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1.5" />
                    {formatOrderNumber(product.order)}
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onQuantityChange(quantity - 1)}
                        disabled={quantity <= 0}
                        className="px-2"
                      >
                        -
                      </Button>
                      
                      <Input
                        type="number"
                        min="0"
                        value={quantity || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            onQuantityChange(value);
                          }
                        }}
                        placeholder={product.desiredStock.toString()}
                        className="text-center"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onQuantityChange(quantity + 1)}
                        className="px-2"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </div>
                    {isSelected && (
                      <div className="text-sm text-gray-500">
                        Total: {formatPrice(product.price * quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Header>
      </Card>

      {/* Product Order Modal */}
      <ProductOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
        products={products}
        onOrderChange={handleOrderChange}
      />

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
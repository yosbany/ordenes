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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if click was on the quantity controls or other interactive elements
    const isQuantityControl = (e.target as HTMLElement).closest('.quantity-controls');
    const isOrderButton = (e.target as HTMLElement).closest('.order-button');
    const isEditButton = (e.target as HTMLElement).closest('.edit-button');

    if (isQuantityControl || isOrderButton || isEditButton) {
      return;
    }

    // If not already selected, select with desired stock
    if (!isSelected) {
      onQuantityChange(product.desiredStock);
      onReview();
    } else {
      // If already selected, increment by 1
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <>
      <Card isSelected={isSelected}>
        <Card.Header className="!p-3">
          <div 
            className="relative cursor-pointer"
            onClick={handleCardClick}
          >
            {/* Review Indicator */}
            {isReviewed && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Selection Indicator */}
              <div className="flex-shrink-0 mt-1">
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded-full edit-button"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>

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
                      inline-flex items-center px-2 py-1 rounded-md text-sm transition-colors order-button
                      ${sectorColor.bg} ${sectorColor.border} ${sectorColor.text}
                      hover:opacity-90
                    `}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1.5" />
                    {formatOrderNumber(product.order)}
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-end justify-between gap-4 quantity-controls">
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
import React, { useState, useEffect } from 'react';
import { Product, Provider } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductSelector } from './ProductSelector';
import { formatPrice } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';

interface FullscreenOrderEditorProps {
  products: Product[];
  selectedProducts: Map<string, number>;
  onProductSelect: (productId: string, quantity: number) => void;
  onProductUpdate?: (id: string, data: Partial<Product>) => Promise<void>;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  provider: Provider;
}

export function FullscreenOrderEditor({
  products,
  selectedProducts,
  onProductSelect,
  onProductUpdate,
  onConfirm,
  onCancel,
  isSubmitting,
  provider
}: FullscreenOrderEditorProps) {
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const { orders } = useOrders(provider.id);

  // Update allProducts when products change
  useEffect(() => {
    setAllProducts(prevProducts => {
      const productIds = new Set(products.map(p => p.id));
      // Keep external products that are not in the original products list
      const externalProducts = prevProducts.filter(p => !productIds.has(p.id));
      return [...products, ...externalProducts];
    });
  }, [products]);

  // Calculate total
  const total = Array.from(selectedProducts.entries()).reduce((sum, [productId, quantity]) => {
    const product = allProducts.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-2 h-14">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {provider.legalName && provider.legalName !== provider.commercialName ? (
                <span className="text-gray-500">
                  {provider.legalName} <span className="mx-1">•</span> 
                </span>
              ) : null}
              <span>{provider.commercialName}</span>
            </h2>
            {selectedProducts.size > 0 && (
              <div className="text-sm text-gray-600">
                Importe Total: <span className="font-medium text-blue-600">{formatPrice(total)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isSubmitting}
              size="sm"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto max-w-3xl px-2 py-4">
            <ProductSelector
              products={allProducts}
              selectedProducts={selectedProducts}
              onProductSelect={onProductSelect}
              onProductUpdate={onProductUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
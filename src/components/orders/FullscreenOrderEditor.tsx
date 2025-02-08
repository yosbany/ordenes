import React, { useState, useEffect } from 'react';
import { Product, Provider } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductSelector } from './ProductSelector';
import { formatPrice } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { useOrderAutosave } from '@/hooks/useOrderAutosave';
import { toast } from 'react-hot-toast';
import { X, ShoppingCart } from 'lucide-react';

interface FullscreenOrderEditorProps {
  products: Product[];
  selectedProducts: Map<string, number>;
  onProductSelect: (productId: string, quantity: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  provider: Provider;
  orderId?: string;
}

export function FullscreenOrderEditor({
  products,
  selectedProducts,
  onProductSelect,
  onConfirm,
  onCancel,
  isSubmitting,
  provider,
  orderId
}: FullscreenOrderEditorProps) {
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const { orders, addOrder, updateOrder } = useOrders(provider.id);
  const [isSaving, setIsSaving] = useState(false);

  // Update allProducts when products change
  useEffect(() => {
    setAllProducts(prevProducts => {
      const productIds = new Set(products.map(p => p.id));
      // Keep external products that are not in the original products list
      const externalProducts = prevProducts.filter(p => !productIds.has(p.id));
      return [...products, ...externalProducts];
    });
  }, [products]);

  // Enable autosave
  useOrderAutosave({
    providerId: provider.id,
    selectedProducts,
    products: allProducts,
    orderId,
    onSave: async (orderData) => {
      if (isSaving) return;
      
      setIsSaving(true);
      try {
        if (orderId) {
          // Update existing order
          await updateOrder(orderId, orderData);
        } else {
          // Create new order
          await addOrder(orderData);
        }
      } catch (error) {
        console.error('Error saving order:', error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
  });

  // Calculate total
  const total = Array.from(selectedProducts.entries()).reduce((sum, [productId, quantity]) => {
    const product = allProducts.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Colored Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {provider.commercialName}
              </h2>
              {provider.legalName && provider.legalName !== provider.commercialName && (
                <p className="text-xs text-indigo-100 truncate">
                  {provider.legalName}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2 hover:bg-white/10 text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Total and Save Button */}
        {selectedProducts.size > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-indigo-400">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base text-indigo-100">Total:</span>
              <span className="text-lg sm:text-xl font-bold">{formatPrice(total)}</span>
            </div>
            <Button 
              onClick={onConfirm} 
              isLoading={isSubmitting || isSaving}
              className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50"
            >
              {orderId ? 'Actualizar' : 'Guardar'} Orden
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <ProductSelector
            products={allProducts}
            selectedProducts={selectedProducts}
            onProductSelect={onProductSelect}
            allowEdit={false}
          />
        </div>
      </div>
    </div>
  );
}
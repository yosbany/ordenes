import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { TopProduct } from '@/lib/services/analytics';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart } from 'lucide-react';

interface TopProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TopProduct[];
}

export function TopProductsModal({ isOpen, onClose, products }: TopProductsModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Top 10 Productos Más Comprados"
    >
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-start gap-4 p-4 bg-white rounded-lg border transition-colors hover:bg-gray-50"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              
              <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{product.totalQuantity} unidades</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.orderCount} órdenes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
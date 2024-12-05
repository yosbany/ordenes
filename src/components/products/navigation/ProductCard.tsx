import React from 'react';
import { Package, Archive, DollarSign } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, formatOrderNumber } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <div className="mt-2 text-xl font-semibold text-blue-600">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Empaque</label>
              <div className="flex items-center mt-1">
                <Package className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-lg text-gray-900">{product.packaging}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Stock</label>
              <div className="flex items-center mt-1">
                <Archive className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-lg text-gray-900">
                  {product.minPackageStock} - {product.desiredStock}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Orden</label>
              <div className="text-lg text-gray-900 mt-1">
                {formatOrderNumber(product.order)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Precio</label>
              <div className="flex items-center mt-1">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-lg text-gray-900">{formatPrice(product.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
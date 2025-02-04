import React from 'react';
import { Package, Archive, Pencil, Trash2, ArrowUpDown, FileText, ChefHat } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, formatOrderNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete
}: ProductCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="space-y-4">
        {/* Product Name with Production Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
            {product.isProduction && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                <ChefHat className="w-3 h-3 mr-1" />
                Producción
              </span>
            )}
          </h3>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-500" />
            <span className="truncate">{product.purchasePackaging}</span>
          </div>
          <div className="flex items-center">
            <Archive className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-500" />
            <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-500" />
            <span className="truncate">
              {product.supplierCode || 'Sin código'}
            </span>
          </div>
          <div className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{formatOrderNumber(product.order)}</span>
          </div>
        </div>

        {/* Actions with Price */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
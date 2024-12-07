import React from 'react';
import { Package, Archive, Pencil, Trash2, ArrowUpDown, FileText } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, formatOrderNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FullscreenProductForm } from '@/components/products/FullscreenProductForm';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  providerId: string;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  providerId
}: ProductCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleUpdate = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      await onEdit(product);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="space-y-4">
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>

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
                onClick={() => setIsEditing(true)}
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

      {/* Fullscreen Edit Form */}
      {isEditing && (
        <FullscreenProductForm
          providerId={providerId}
          initialData={product}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
}
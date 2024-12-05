import React, { useState } from 'react';
import { Package, Archive, ArrowUpDown, Barcode, Tag, Hash } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber, getSectorFromOrder } from '@/lib/order/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductOrderModal } from './ProductOrderModal';
import { getSectorColor } from '@/lib/sectorColors';

interface ProductCardProps {
  product: Product;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onOrderChange: (product: Product, newOrder: number) => Promise<void>;
  isSelected?: boolean;
}

export function ProductCard({ 
  product, 
  products,
  onEdit, 
  onDelete,
  onOrderChange,
  isSelected 
}: ProductCardProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const sectorColor = getSectorColor(getSectorFromOrder(product.order));

  return (
    <>
      <Card isSelected={isSelected}>
        <Card.Header className="!p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 break-words mb-2">
                {product.name}
              </h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Barcode className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    SKU: {product.sku}
                  </span>
                </div>
                {product.supplierCode && (
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">
                      Cód: {product.supplierCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {product.purchasePackaging} → {product.salePackaging}
                  </span>
                </div>
                <div className="flex items-center">
                  <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Stock: {product.minPackageStock} - {product.desiredStock}</span>
                </div>
                <div className="col-span-2">
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
                {product.tags && product.tags.length > 0 && (
                  <div className="col-span-2 flex items-start gap-1.5 mt-1">
                    <Tag className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>
        </Card.Header>

        <Card.Footer className="flex flex-wrap gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(product)}
          >
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(product)}
            className="hover:bg-red-50 hover:text-red-600"
          >
            Eliminar
          </Button>
        </Card.Footer>
      </Card>

      <ProductOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
        products={products}
        onOrderChange={onOrderChange}
      />
    </>
  );
}
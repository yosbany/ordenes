import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { TagStats } from '@/lib/services/analytics/calculations';
import { formatPrice } from '@/lib/utils';
import { Tag, Package, ShoppingCart } from 'lucide-react';

interface TopProductsByTagsProps {
  isOpen: boolean;
  onClose: () => void;
  tagStats: TagStats[];
}

export function TopProductsByTags({ isOpen, onClose, tagStats }: TopProductsByTagsProps) {
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Top Productos por Etiquetas"
    >
      <div className="space-y-4">
        {tagStats.map((tagStat) => (
          <div
            key={tagStat.tag}
            className="bg-white p-4 rounded-lg border transition-colors hover:bg-gray-50"
          >
            {/* Tag Header */}
            <button
              onClick={() => setExpandedTag(expandedTag === tagStat.tag ? null : tagStat.tag)}
              className="w-full"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{tagStat.tag}</h3>
                    <p className="text-sm text-gray-500">
                      {tagStat.products.length} productos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-600">
                    {formatPrice(tagStat.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tagStat.orderCount} órdenes
                  </div>
                </div>
              </div>
            </button>

            {/* Products List */}
            {expandedTag === tagStat.tag && (
              <div className="mt-4 space-y-3">
                {tagStat.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {product.totalQuantity} {product.purchasePackaging}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          {product.orderCount} órdenes
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">
                        {formatPrice(product.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {tagStats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos disponibles
          </div>
        )}
      </div>
    </Dialog>
  );
}
import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { TagStats } from '@/lib/services/analytics';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TopProductsByTagsProps {
  isOpen: boolean;
  onClose: () => void;
  tagStats: TagStats[];
}

export function TopProductsByTags({ isOpen, onClose, tagStats = [] }: TopProductsByTagsProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Top 10 Productos por Etiquetas"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {tagStats.map((tagStat, index) => (
          <div
            key={tagStat.tag}
            className={`
              relative overflow-hidden bg-white rounded-lg border transition-all duration-200
              ${index === 0 ? 'shadow-md ring-2 ring-blue-100 border-blue-200' : 'border-gray-200'}
            `}
          >
            {/* Position Badge - Only for top 3 */}
            {index < 3 && (
              <div className={`
                absolute top-0 left-0 w-16 h-16 flex items-center justify-center
                ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-indigo-500' : 'bg-violet-500'}
                text-white font-bold text-2xl -rotate-45 transform -translate-x-6 -translate-y-6
              `}>
                #{index + 1}
              </div>
            )}

            <div className="p-4 sm:p-6">
              <div className="ml-8">
                {/* Tag Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {tagStat.tag}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {tagStat.products.length} productos
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(tagStat.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Total Compras
                    </div>
                  </div>
                </div>

                {/* Tag Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Unidades Compradas
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {tagStat.totalQuantity}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Órdenes
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {tagStat.orderCount}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Promedio por Orden
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(tagStat.totalAmount / tagStat.orderCount)}
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Top Productos
                  </h4>
                  {tagStat.products.slice(0, 5).map((product, productIndex) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.totalQuantity} {product.purchasePackaging} • {product.orderCount} órdenes
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-medium text-blue-600">
                          {formatPrice(product.totalAmount)}
                        </div>
                        {product.lastOrderDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            {format(product.lastOrderDate, "d MMM, yyyy", { locale: es })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
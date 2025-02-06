import React from 'react';
import { Tag, Package, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import { TagStats } from '@/lib/services/analytics';

interface TagProductsCardProps {
  tagStats: TagStats[];
  onClick?: () => void;
  loading?: boolean;
}

export function TagProductsCard({ tagStats, onClick, loading }: TagProductsCardProps) {
  if (loading) {
    return (
      <Card>
        <Card.Header className="!p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card.Header>
      </Card>
    );
  }

  if (tagStats.length === 0) {
    return null;
  }

  const topTag = tagStats[0];

  return (
    <Card 
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <Card.Header className="!p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Tag className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Productos por Etiquetas
              </h3>
            </div>

            <div className="space-y-3">
              {/* Top Tag Summary */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 truncate">
                    {topTag.tag}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700">
                    {topTag.products.length} productos
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{topTag.totalQuantity} unidades</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{topTag.orderCount} órdenes</span>
                  </div>
                </div>
              </div>

              {/* Top Products in Tag */}
              <div className="space-y-2">
                {topTag.products.slice(0, 3).map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {product.totalQuantity} {product.purchasePackaging}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 whitespace-nowrap">
                      {formatPrice(product.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Ventas</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(topTag.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}
import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { ProductStats } from '@/lib/services/analytics';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, TrendingUp, Calendar, Tags } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';

interface TopProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductStats[];
}

export function TopProductsModal({ isOpen, onClose, products = [] }: TopProductsModalProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags from all products
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      if (product.tags) {
        product.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [products]);

  // Filter products by selected tag
  const filteredProducts = useMemo(() => {
    if (!selectedTag) return products;
    return products.filter(product => 
      product.tags?.includes(selectedTag)
    );
  }, [products, selectedTag]);

  // Calculate totals for filtered products
  const totals = useMemo(() => ({
    amount: filteredProducts.reduce((sum, p) => sum + p.totalAmount, 0),
    quantity: filteredProducts.reduce((sum, p) => sum + p.totalQuantity, 0),
    orders: filteredProducts.reduce((sum, p) => sum + p.orderCount, 0),
    average: filteredProducts.length > 0
      ? filteredProducts.reduce((sum, p) => sum + p.totalAmount, 0) / 
        filteredProducts.reduce((sum, p) => sum + p.orderCount, 0)
      : 0
  }), [filteredProducts]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Top 10 Productos Más Comprados"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <Tags className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtrar por etiqueta:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="h-8"
              >
                Todas
              </Button>
              {availableTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="h-8"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-blue-900">Total Compras</h4>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {formatPrice(totals.amount)}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-green-900">Total Unidades</h4>
            </div>
            <div className="text-lg font-bold text-green-700">
              {totals.quantity}
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-sm font-medium text-indigo-900">Total Órdenes</h4>
            </div>
            <div className="text-lg font-bold text-indigo-700">
              {totals.orders}
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-medium text-amber-900">Promedio por Orden</h4>
            </div>
            <div className="text-lg font-bold text-amber-700">
              {formatPrice(totals.average)}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`
                relative overflow-hidden bg-white rounded-lg border transition-all duration-200
                ${index === 0 ? 'shadow-md ring-2 ring-blue-100 border-blue-200' : 'border-gray-200 hover:border-gray-300'}
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
                  {/* Product Name and Basic Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {product.name}
                      </h3>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.tags.map(tag => (
                            <span
                              key={tag}
                              className={`
                                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                ${tag === selectedTag 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }
                              `}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(product.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Total Compras
                      </div>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Unidades Compradas
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {product.totalQuantity} {product.purchasePackaging}
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
                        {product.orderCount}
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
                        {(product.totalQuantity / product.orderCount).toFixed(1)} {product.purchasePackaging}
                      </div>
                    </div>
                  </div>

                  {/* Last Order Date */}
                  {product.lastOrderDate && (
                    <div className="mt-4 text-sm text-gray-500">
                      Última compra: {format(product.lastOrderDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedTag 
                ? `No hay productos con la etiqueta "${selectedTag}"`
                : 'No hay datos disponibles'
              }
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Package, Archive, Pencil, Trash2, ArrowUpDown, FileText, ChefHat, ShoppingCart, History } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, formatOrderNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [showHistory, setShowHistory] = useState(false);

  // Calculate margin if product is for sale
  const margin = product.forSale && product.salePrice && product.price
    ? ((product.salePrice - product.price) / product.salePrice) * 100
    : null;

  // Get margin color based on value
  const getMarginColor = (margin: number | null) => {
    if (margin === null) return 'text-gray-700 bg-gray-50';
    if (margin < 0) return 'text-red-700 bg-red-50';
    if (margin <= 5) return 'text-orange-700 bg-orange-50';
    return 'text-green-700 bg-green-50';
  };

  // Get last price change
  const lastPriceChange = product.priceHistory?.[product.priceHistory.length - 1];
  const lastSalePriceChange = product.salePriceHistory?.[product.salePriceHistory.length - 1];

  // Check if price changes exceed threshold
  const priceThreshold = product.priceThreshold || 20;
  const significantPriceChange = lastPriceChange && Math.abs(lastPriceChange.changePercentage) > priceThreshold;
  const significantSalePriceChange = lastSalePriceChange && Math.abs(lastSalePriceChange.changePercentage) > priceThreshold;

  return (
    <>
      <div className={`
        bg-white rounded-lg transition-all duration-200
        ${margin !== null
          ? margin < 0
            ? 'border-2 border-red-200'
            : margin <= 5
              ? 'border-2 border-orange-200'
              : 'border-2 border-green-200'
          : 'border border-gray-200'
        }
        hover:shadow-md
      `}>
        <div className="p-4 sm:p-6 space-y-4">
          {/* Header Section */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">
                  {product.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {product.isProduction && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <ChefHat className="w-3 h-3 mr-1" />
                      Producción
                    </span>
                  )}
                  {product.forSale && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Venta
                    </span>
                  )}
                  {product.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Empaque</span>
              </div>
              <span className="text-sm text-gray-900">{product.purchasePackaging}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Orden</span>
              </div>
              <span className="text-sm text-gray-900">{formatOrderNumber(product.order)}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Archive className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Stock</span>
              </div>
              <span className="text-sm text-gray-900">
                {product.minPackageStock} - {product.desiredStock} {product.purchasePackaging}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Código</span>
              </div>
              <span className="text-sm text-gray-900">
                {product.supplierCode || 'Sin código'}
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="pt-4 border-t space-y-3">
            {/* Purchase Price */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Precio Compra:</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {significantPriceChange && (
                  <div className={`text-xs ${lastPriceChange.changePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {lastPriceChange.changePercentage > 0 ? '+' : ''}
                    {lastPriceChange.changePercentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Sale Price and Margin */}
            {product.forSale && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio Venta:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.salePrice || 0)}
                    </span>
                    {significantSalePriceChange && (
                      <div className={`text-xs ${lastSalePriceChange.changePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {lastSalePriceChange.changePercentage > 0 ? '+' : ''}
                        {lastSalePriceChange.changePercentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>

                {margin !== null && (
                  <div className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${getMarginColor(margin)}
                  `}>
                    <span className="text-sm font-medium">Margen:</span>
                    <span className="text-lg font-bold">
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {(product.priceHistory?.length > 0 || product.salePriceHistory?.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="bg-white"
              >
                <History className="w-4 h-4 mr-2" />
                Historial
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="bg-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product)}
              className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      {/* Price History Modal */}
      <Dialog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title={`Historial de Precios - ${product.name}`}
      >
        <div className="space-y-6">
          {/* Purchase Price History */}
          {product.priceHistory && product.priceHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Precios de Compra</h3>
              <div className="space-y-3">
                {product.priceHistory.map((entry, index) => {
                  const isSignificantChange = Math.abs(entry.changePercentage) > (product.priceThreshold || 20);
                  const isIncrease = entry.changePercentage > 0;

                  return (
                    <div 
                      key={entry.date}
                      className={`p-3 rounded-lg ${
                        isSignificantChange
                          ? isIncrease
                            ? 'bg-red-50 border-2 border-red-200'
                            : 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {format(entry.date, "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                        </span>
                        <span className={`text-sm font-medium ${
                          entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {entry.changePercentage > 0 ? '+' : ''}
                          {entry.changePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">
                          {formatPrice(entry.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sale Price History */}
          {product.salePriceHistory && product.salePriceHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Precios de Venta</h3>
              <div className="space-y-3">
                {product.salePriceHistory.map((entry, index) => {
                  const isSignificantChange = Math.abs(entry.changePercentage) > (product.priceThreshold || 20);
                  const isIncrease = entry.changePercentage > 0;

                  return (
                    <div 
                      key={entry.date}
                      className={`p-3 rounded-lg ${
                        isSignificantChange
                          ? isIncrease
                            ? 'bg-red-50 border-2 border-red-200'
                            : 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {format(entry.date, "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                        </span>
                        <span className={`text-sm font-medium ${
                          entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {entry.changePercentage > 0 ? '+' : ''}
                          {entry.changePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">
                          {formatPrice(entry.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No History Message */}
          {(!product.priceHistory || product.priceHistory.length === 0) &&
           (!product.salePriceHistory || product.salePriceHistory.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No hay historial de precios disponible
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowHistory(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
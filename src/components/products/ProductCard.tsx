import React, { useState } from 'react';
import { Package, Archive, Pencil, Trash2, ArrowUpDown, FileText, ChefHat, ShoppingCart, History, Scale, TrendingUp, TrendingDown, Power } from 'lucide-react';
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
  onStockAdjust?: (product: Product) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onStockAdjust
}: ProductCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Calculate margin using saleCostPerUnit if product is for sale
  const margin = product.forSale && product.salePrice && product.saleCostPerUnit
    ? ((product.salePrice - product.saleCostPerUnit) / product.salePrice) * 100
    : null;

  // Get margin color based on value
  const getMarginColor = (margin: number | null) => {
    if (margin === null) return 'text-gray-700 bg-gray-50';
    if (margin < 0) return 'text-red-700 bg-red-50';
    if (margin <= 5) return 'text-orange-700 bg-orange-50';
    return 'text-green-700 bg-green-50';
  };

  // Get last price change
  const lastSalePriceChange = product.salePriceHistory?.[product.salePriceHistory.length - 1];

  // Get enabled state - default to true if not explicitly set
  const isEnabled = product.enabled !== false;

  // Combine all history entries for chronological display
  const getAllHistoryEntries = () => {
    const entries: Array<{
      date: number;
      type: 'purchase' | 'sale' | 'stock';
      value: number;
      changePercentage?: number;
      notes?: string;
    }> = [];

    // Add purchase price history
    if (product.priceHistory) {
      entries.push(...product.priceHistory.map(entry => ({
        date: entry.date,
        type: 'purchase' as const,
        value: entry.price,
        changePercentage: entry.changePercentage
      })));
    }

    // Add sale price history
    if (product.salePriceHistory) {
      entries.push(...product.salePriceHistory.map(entry => ({
        date: entry.date,
        type: 'sale' as const,
        value: entry.price,
        changePercentage: entry.changePercentage
      })));
    }

    // Add stock adjustments
    if (product.stockAdjustments) {
      entries.push(...product.stockAdjustments.map(entry => ({
        date: entry.date,
        type: 'stock' as const,
        value: entry.quantity,
        notes: entry.notes
      })));
    }

    // Sort by date in descending order
    return entries.sort((a, b) => b.date - a.date);
  };

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
        <div className="p-3 space-y-2">
          {/* Header with Name and Tags */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 leading-tight break-words">
                {product.name}
                <span className={`
                  ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium gap-1
                  ${isEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  <Power className="w-3 h-3" />
                  {isEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </h3>

              {/* Product Codes */}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {product.sku}
                </span>
                {product.supplierCode && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {product.supplierCode}
                    </span>
                  </>
                )}
              </div>

              {/* Product Tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {product.isProduction && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    <ChefHat className="w-3 h-3 mr-0.5" />
                    Prod
                  </span>
                )}
                {product.forSale && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <ShoppingCart className="w-3 h-3 mr-0.5" />
                    Venta
                  </span>
                )}
                {product.tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {formatOrderNumber(product.order)}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">
                Compra <span className="text-xs text-gray-500">({product.purchasePackaging})</span>:
              </span>
              <span className="font-medium text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {product.isProduction && (
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">
                  Costo <span className="text-xs text-gray-500">({product.unitMeasure || product.purchasePackaging})</span>:
                </span>
                <span className="font-medium">
                  {formatPrice(product.pricePerUnit || 0)}
                </span>
              </div>
            )}

            {product.forSale && (
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">
                  Venta <span className="text-xs text-gray-500">({product.saleUnit || product.purchasePackaging})</span>:
                </span>
                <span className="font-medium">
                  {formatPrice(product.salePrice || 0)}
                  {lastSalePriceChange && Math.abs(lastSalePriceChange.changePercentage) > (product.priceThreshold || 20) && (
                    <span className={`ml-1 text-xs ${lastSalePriceChange.changePercentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {lastSalePriceChange.changePercentage > 0 ? '↑' : '↓'}
                      {Math.abs(lastSalePriceChange.changePercentage).toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Stock: {product.minPackageStock}-{product.desiredStock} 
              <span className="text-xs text-gray-500 ml-1">
                {product.purchasePackaging}
              </span>
            </span>
            {margin !== null && (
              <span className={`px-2 py-0.5 rounded-md ${getMarginColor(margin)}`}>
                Margen: {margin.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-1 pt-2 border-t">
            {onStockAdjust && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStockAdjust(product)}
                className="w-7 h-7 p-0"
                title="Ajustar stock"
              >
                <Scale className="w-3.5 h-3.5 text-gray-600 hover:text-gray-900" />
              </Button>
            )}

            {(product.salePriceHistory?.length > 0 || product.priceHistory?.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="w-7 h-7 p-0"
                title="Historial de precios"
              >
                <History className="w-3.5 h-3.5 text-gray-600 hover:text-gray-900" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="w-7 h-7 p-0"
              title="Editar producto"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-600 hover:text-gray-900" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              className="w-7 h-7 p-0"
              title="Eliminar producto"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
            </Button>
          </div>

          {/* Last Update */}
          <div className="text-[10px] text-gray-400 pt-1 border-t">
            Actualizado: {format(product.lastUpdated || Date.now(), "d MMM yyyy HH:mm", { locale: es })}
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Dialog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title={`Historial de Cambios - ${product.name}`}
      >
        <div className="space-y-6">
          {/* Combined History */}
          <div className="space-y-3">
            {getAllHistoryEntries().map((entry, index) => {
              const isSignificantChange = entry.type !== 'stock' && 
                Math.abs(entry.changePercentage || 0) > (product.priceThreshold || 20);
              const isIncrease = entry.value > 0;

              return (
                <div 
                  key={`${entry.date}-${index}`}
                  className={`p-3 rounded-lg ${
                    entry.type === 'stock'
                      ? isIncrease
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                      : isSignificantChange
                        ? isIncrease
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-green-50 border-2 border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Date and Type */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">
                      {format(entry.date, "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      entry.type === 'purchase' 
                        ? 'bg-blue-100 text-blue-800'
                        : entry.type === 'sale'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.type === 'purchase' 
                        ? 'Precio Compra'
                        : entry.type === 'sale'
                          ? 'Precio Venta'
                          : 'Stock'
                      }
                    </span>
                  </div>

                  {/* Value and Change */}
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {entry.type === 'stock' ? (
                        <div className="flex items-center gap-1">
                          {isIncrease ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                            {entry.value > 0 ? '+' : ''}{entry.value} {product.purchasePackaging}
                          </span>
                        </div>
                      ) : (
                        formatPrice(entry.value)
                      )}
                    </div>
                    {entry.type !== 'stock' && entry.changePercentage && (
                      <span className={`text-sm font-medium ${
                        entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {entry.changePercentage > 0 ? '+' : ''}
                        {entry.changePercentage.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Notes for stock adjustments */}
                  {entry.type === 'stock' && entry.notes && (
                    <div className="mt-1 text-sm text-gray-600">
                      {entry.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No History Message */}
          {getAllHistoryEntries().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay historial de cambios disponible
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
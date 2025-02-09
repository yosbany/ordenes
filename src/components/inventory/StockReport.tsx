import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { StockAdjustment } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface StockReportProps {
  data: {
    sku: string;
    names: string[];
    stockAdjustments: StockAdjustment[];
    packaging: string;
    unitCost: number;
    processed?: boolean;
  }[];
  maxDate: Date | null;
  onClose: () => void;
}

export function StockReport({ data, maxDate, onClose }: StockReportProps) {
  const handlePrint = () => {
    window.print();
  };

  // Filter data to show items with adjustments >= maxDate
  const filteredData = maxDate 
    ? data.filter(item => item.stockAdjustments.some(adj => adj.date >= maxDate.getTime()))
    : data;

  // Calculate global totals
  const globalTotals = filteredData.reduce((acc, item) => {
    const surplusAdjustments = item.stockAdjustments
      .filter(adj => adj.quantity > 0 && (!maxDate || adj.date >= maxDate.getTime()));
    const shortageAdjustments = item.stockAdjustments
      .filter(adj => adj.quantity < 0 && (!maxDate || adj.date >= maxDate.getTime()));

    const totalSurplus = surplusAdjustments.reduce((sum, adj) => sum + adj.quantity, 0);
    const totalShortage = Math.abs(shortageAdjustments.reduce((sum, adj) => sum + adj.quantity, 0));

    const surplusValue = totalSurplus * item.unitCost;
    const shortageValue = totalShortage * item.unitCost;

    return {
      surplusQuantity: acc.surplusQuantity + totalSurplus,
      shortageQuantity: acc.shortageQuantity + totalShortage,
      surplusValue: acc.surplusValue + surplusValue,
      shortageValue: acc.shortageValue + shortageValue
    };
  }, {
    surplusQuantity: 0,
    shortageQuantity: 0,
    surplusValue: 0,
    shortageValue: 0
  });

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header - Hidden when printing */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print:hidden">
        <h2 className="text-xl font-semibold">Reporte de Ajustes de Stock</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            Imprimir
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Print Header - Only shown when printing */}
      <div className="hidden print:block text-center mb-6 p-4">
        <h1 className="text-2xl font-bold mb-2">Reporte de Ajustes de Stock</h1>
        <p className="text-gray-600">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
        {maxDate && (
          <p className="text-sm text-gray-500 mt-1">
            Ajustes desde: {format(maxDate, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        )}
      </div>

      {/* Global Summary */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Surplus Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-3">Total Sobrantes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-green-600">Cantidad</div>
                <div className="text-lg font-bold text-green-700">
                  {globalTotals.surplusQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-green-600">Valor</div>
                <div className="text-lg font-bold text-green-700">
                  {formatPrice(globalTotals.surplusValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Shortage Summary */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-3">Total Faltantes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-red-600">Cantidad</div>
                <div className="text-lg font-bold text-red-700">
                  {globalTotals.shortageQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-red-600">Valor</div>
                <div className="text-lg font-bold text-red-700">
                  {formatPrice(globalTotals.shortageValue)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-4">
        {filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((item) => {
              // Calculate totals for this item
              const surplusAdjustments = item.stockAdjustments
                .filter(adj => adj.quantity > 0 && (!maxDate || adj.date >= maxDate.getTime()));
              const shortageAdjustments = item.stockAdjustments
                .filter(adj => adj.quantity < 0 && (!maxDate || adj.date >= maxDate.getTime()));

              const totalSurplus = surplusAdjustments.reduce((sum, adj) => sum + adj.quantity, 0);
              const totalShortage = Math.abs(shortageAdjustments.reduce((sum, adj) => sum + adj.quantity, 0));

              const surplusValue = totalSurplus * item.unitCost;
              const shortageValue = totalShortage * item.unitCost;

              return (
                <div key={item.sku} className="border rounded-lg overflow-hidden">
                  {/* Product Header */}
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">SKU: {item.sku}</h3>
                          {typeof item.processed !== 'undefined' && (
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                              ${item.processed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                              }
                            `}>
                              {item.processed ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Procesado
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Pendiente
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {item.names.map((name, index) => (
                          <p 
                            key={index} 
                            className={item.names.length > 1 ? 'text-sm text-gray-600' : ''}
                          >
                            {name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Adjustments Table */}
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Ajuste</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Valor</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {item.stockAdjustments
                        .filter(adj => !maxDate || adj.date >= maxDate.getTime())
                        .sort((a, b) => b.date - a.date)
                        .map((adjustment, index) => {
                          const adjustmentValue = Math.abs(adjustment.quantity * item.unitCost);
                          return (
                            <tr key={`${item.sku}-${index}`} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {format(adjustment.date, "d/MM/yyyy HH:mm", { locale: es })}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center justify-end gap-1">
                                  {adjustment.quantity > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    adjustment.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {adjustment.quantity > 0 ? '+' : ''}
                                    {adjustment.quantity} {item.packaging}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className={`text-sm font-medium ${
                                  adjustment.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatPrice(adjustmentValue)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {adjustment.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">Total Sobrantes:</span>
                          <span className="font-medium text-green-600">
                            {totalSurplus} {item.packaging}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-medium text-green-600">
                            {formatPrice(surplusValue)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">Total Faltantes:</span>
                          <span className="font-medium text-red-600">
                            {totalShortage} {item.packaging}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-medium text-red-600">
                            {formatPrice(shortageValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay ajustes de stock en el período seleccionado
          </div>
        )}
      </div>
    </div>
  );
}
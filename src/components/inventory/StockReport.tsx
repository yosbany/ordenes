import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { StockAdjustment } from '@/types';
import { Button } from '@/components/ui/Button';

interface StockReportProps {
  data: {
    sku: string;
    names: string[];
    stockAdjustments: StockAdjustment[];
    packaging: string;
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

      {/* Report Content */}
      <div className="p-4">
        {filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((item) => (
              <div key={item.sku} className="border rounded-lg overflow-hidden">
                {/* Product Header */}
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-medium text-gray-900">SKU: {item.sku}</h3>
                  {item.names.map((name, index) => (
                    <p 
                      key={index} 
                      className={item.names.length > 1 ? 'text-sm text-gray-600' : ''}
                    >
                      {name}
                    </p>
                  ))}
                </div>

                {/* Adjustments Table */}
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Ajuste</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {item.stockAdjustments
                      .filter(adj => !maxDate || adj.date >= maxDate.getTime())
                      .sort((a, b) => b.date - a.date)
                      .map((adjustment, index) => (
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
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {adjustment.notes || '-'}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary */}
                <div className="bg-gray-50 p-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Sobrantes:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {item.stockAdjustments
                          .filter(adj => adj.quantity > 0)
                          .reduce((sum, adj) => sum + adj.quantity, 0)} {item.packaging}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Faltantes:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {Math.abs(item.stockAdjustments
                          .filter(adj => adj.quantity < 0)
                          .reduce((sum, adj) => sum + adj.quantity, 0))} {item.packaging}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
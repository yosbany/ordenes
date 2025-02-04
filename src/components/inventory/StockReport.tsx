import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StockReportProps {
  data: {
    sku: string;
    names: string[];
    currentStock: number;
    lastStockCheck: number | null;
    packaging: string;
  }[];
  maxDate: Date | null;
  onClose: () => void;
}

export function StockReport({ data, maxDate, onClose }: StockReportProps) {
  const handlePrint = () => {
    window.print();
  };

  // Filter data to show items with lastStockCheck >= maxDate
  const filteredData = maxDate 
    ? data.filter(item => item.lastStockCheck && new Date(item.lastStockCheck) >= maxDate)
    : data;

  // Sort by last check date (most recent first)
  const sortedData = [...filteredData].sort((a, b) => {
    if (!a.lastStockCheck) return 1;
    if (!b.lastStockCheck) return -1;
    return b.lastStockCheck - a.lastStockCheck;
  });

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header - Hidden when printing */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print:hidden">
        <h2 className="text-xl font-semibold">Reporte de Control de Stock</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Print Header - Only shown when printing */}
      <div className="hidden print:block text-center mb-6 p-4">
        <h1 className="text-2xl font-bold mb-2">Reporte de Control de Stock</h1>
        <p className="text-gray-600">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
        {maxDate && (
          <p className="text-sm text-gray-500 mt-1">
            Controles desde: {format(maxDate, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        )}
      </div>

      {/* Report Content */}
      <div className="p-4">
        {sortedData.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2 px-4 text-left">SKU</th>
                <th className="py-2 px-4 text-left">Producto</th>
                <th className="py-2 px-4 text-right">Stock Actual</th>
                <th className="py-2 px-4 text-right">Última Actualización</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.sku} className="border-b border-gray-100">
                  <td className="py-2 px-4">{item.sku}</td>
                  <td className="py-2 px-4">
                    {item.names.map((name, index) => (
                      <div 
                        key={index} 
                        className={item.names.length > 1 ? 'text-sm text-gray-600' : ''}
                      >
                        {name}
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4 text-right whitespace-nowrap">
                    {item.currentStock} {item.packaging}
                  </td>
                  <td className="py-2 px-4 text-right whitespace-nowrap">
                    {item.lastStockCheck ? (
                      format(new Date(item.lastStockCheck), "d/MM/yyyy HH:mm", { locale: es })
                    ) : (
                      <span className="text-amber-600">Sin control</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay productos con controles de stock en el período seleccionado
          </div>
        )}

        {/* Summary - Only shown when printing */}
        <div className="hidden print:block mt-8 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Total productos: {sortedData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
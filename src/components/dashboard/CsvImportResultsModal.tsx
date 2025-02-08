import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ImportResult {
  updated: number;
  errors: string[];
  details: {
    updatedProducts: Array<{
      name: string;
      oldPrice: number;
      newPrice: number;
      csvName: string;
      type: 'product' | 'recipe';
    }>;
    notFoundProducts: Array<{
      code: string;
      providerRut?: string;
      csvName: string;
    }>;
    invalidRows: Array<{
      row: number;
      reason: string;
    }>;
  };
}

interface CsvImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
  importType: 'purchase' | 'sale';
}

export function CsvImportResultsModal({ 
  isOpen, 
  onClose, 
  result,
  importType
}: CsvImportResultsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!result) return null;

  const hasUpdates = result.updated > 0;
  const hasErrors = result.errors.length > 0;

  // Filter results based on search term
  const filteredUpdates = result.details.updatedProducts.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.csvName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotFound = result.details.notFoundProducts.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.csvName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.providerRut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvalid = result.details.invalidRows.filter(row =>
    row.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Resultado de la Importación - Precios de ${importType === 'purchase' ? 'Compra' : 'Venta'}`}
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
          {hasUpdates && !hasErrors ? (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          ) : hasErrors ? (
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-medium">Resumen de la importación</h3>
            <p className="text-sm text-gray-600">
              {result.updated} {result.updated === 1 ? 'actualización' : 'actualizaciones'} realizadas
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Buscar en los resultados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Results Sections */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Updated Items */}
          {filteredUpdates.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">
                Actualizaciones ({filteredUpdates.length})
              </h4>
              <div className="space-y-3">
                {filteredUpdates.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-700">{item.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {item.type === 'product' ? 'Producto' : 'Receta'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Nombre en CSV: {item.csvName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Precio anterior: {formatPrice(item.oldPrice)} → 
                      Nuevo precio: {formatPrice(item.newPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Found Items */}
          {filteredNotFound.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-3">
                No encontrados ({filteredNotFound.length})
              </h4>
              <div className="space-y-3">
                {filteredNotFound.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-amber-700">
                      Código: {item.code}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Nombre en CSV: {item.csvName}
                    </div>
                    {item.providerRut && (
                      <div className="text-sm text-gray-600">
                        RUT Proveedor: {item.providerRut}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Rows */}
          {filteredInvalid.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3">
                Filas con errores ({filteredInvalid.length})
              </h4>
              <div className="space-y-3">
                {filteredInvalid.map((error, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-red-700">
                      Fila {error.row}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {error.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && 
           filteredUpdates.length === 0 && 
           filteredNotFound.length === 0 && 
           filteredInvalid.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron resultados para "{searchTerm}"
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
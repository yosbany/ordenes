import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle, AlertCircle, XCircle, Search } from 'lucide-react';

interface ImportResult {
  updated: number;
  errors: string[];
  details: {
    updatedProducts: Array<{
      name: string;
      oldPrice: number;
      newPrice: number;
      csvName: string;
    }>;
    notFoundProducts: Array<{
      code: string;
      providerRut: string;
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
}

export function CsvImportResultsModal({ isOpen, onClose, result }: CsvImportResultsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter results based on search term
  const filteredResults = useMemo(() => {
    if (!result) return null;

    const term = searchTerm.toLowerCase();
    return {
      updatedProducts: result.details.updatedProducts.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.csvName.toLowerCase().includes(term)
      ),
      notFoundProducts: result.details.notFoundProducts.filter(item => 
        item.code.toLowerCase().includes(term) ||
        item.csvName.toLowerCase().includes(term) ||
        item.providerRut.toLowerCase().includes(term)
      ),
      invalidRows: result.details.invalidRows.filter(error => 
        error.reason.toLowerCase().includes(term)
      )
    };
  }, [result, searchTerm]);
  
  if (!result || !filteredResults) return null;

  const hasUpdates = result.updated > 0;
  const hasErrors = result.errors.length > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Resultado de la Importación"
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
              {result.updated} producto{result.updated !== 1 ? 's' : ''} actualizado{result.updated !== 1 ? 's' : ''}
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
          {/* Updated Products */}
          {filteredResults.updatedProducts.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">
                Productos Actualizados ({filteredResults.updatedProducts.length})
              </h4>
              <div className="space-y-3">
                {filteredResults.updatedProducts.map((product, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-green-700">{product.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Nombre en CSV: {product.csvName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Precio anterior: ${product.oldPrice.toFixed(2)} → 
                      Nuevo precio: ${product.newPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Found Products */}
          {filteredResults.notFoundProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-3">
                Productos no encontrados ({filteredResults.notFoundProducts.length})
              </h4>
              <div className="space-y-3">
                {filteredResults.notFoundProducts.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-amber-700">
                      Código: {item.code}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Nombre en CSV: {item.csvName}
                    </div>
                    <div className="text-sm text-gray-600">
                      RUT Proveedor: {item.providerRut}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Rows */}
          {filteredResults.invalidRows.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3">
                Filas con errores ({filteredResults.invalidRows.length})
              </h4>
              <div className="space-y-3">
                {filteredResults.invalidRows.map((error, index) => (
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
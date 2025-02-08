import React, { useState, useRef } from 'react';
import { FileUp, ArrowUpDown, FileText, ChevronDown, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { useProviders } from '@/hooks/useProviders';
import { useRecipes } from '@/hooks/useRecipes';
import { processCsvImport } from '@/lib/utils/csvImport';
import { CsvImportResultsModal } from './CsvImportResultsModal';
import { toast } from 'react-hot-toast';

export function CsvImportCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [importType, setImportType] = useState<'purchase' | 'sale'>('purchase');
  const [isExpanded, setIsExpanded] = useState(false);
  const { products, loading: productsLoading } = useGlobalProducts();
  const { providers, loading: providersLoading } = useProviders();
  const { recipes, loading: recipesLoading } = useRecipes();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = file.name.toLowerCase().endsWith('.csv');
    if (!isValidType) {
      toast.error('El archivo debe ser de tipo CSV');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const result = await processCsvImport(text, products, providers, recipes, importType);
      
      setImportResult(result);
      setIsResultsModalOpen(true);

      if (result.updated > 0) {
        toast.success(`${result.updated} productos/recetas actualizados`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Card>
        <Card.Header className="!p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <FileUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Actualización de Precios</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Importar precios desde archivos CSV
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-6 space-y-6">
              {/* Import Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setImportType('purchase')}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${importType === 'purchase' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      p-2 rounded-lg
                      ${importType === 'purchase' ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                      <ArrowUpDown className={`
                        w-5 h-5
                        ${importType === 'purchase' ? 'text-blue-600' : 'text-gray-600'}
                      `} />
                    </div>
                    <span className={`
                      font-medium
                      ${importType === 'purchase' ? 'text-blue-900' : 'text-gray-700'}
                    `}>
                      Precios de Compra
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setImportType('sale')}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${importType === 'sale' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      p-2 rounded-lg
                      ${importType === 'sale' ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                      <FileText className={`
                        w-5 h-5
                        ${importType === 'sale' ? 'text-blue-600' : 'text-gray-600'}
                      `} />
                    </div>
                    <span className={`
                      font-medium
                      ${importType === 'sale' ? 'text-blue-900' : 'text-gray-700'}
                    `}>
                      Precios de Venta
                    </span>
                  </div>
                </button>
              </div>

              {/* File Input Section */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="relative">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isProcessing}
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <FileUp className="w-6 h-6" />
                    <span className="text-sm">
                      {isProcessing ? 'Procesando archivo...' : 'Seleccionar archivo CSV'}
                    </span>
                  </Button>
                </div>

                {/* Format Instructions */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-3 bg-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Formato Requerido
                      </h4>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2 text-sm text-gray-600">
                      {importType === 'purchase' ? (
                        <>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Columnas: Fecha, RUT, Código, Nombre, Precio
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            El RUT debe coincidir con el proveedor
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Columnas: Código, Artículo, Contado
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            El código debe coincidir con el SKU del producto
                          </p>
                        </>
                      )}
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Separador: Coma (,) o Punto y coma (;)
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Codificación: UTF-8
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card.Header>
      </Card>

      <CsvImportResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        result={importResult}
        importType={importType}
      />
    </>
  );
}
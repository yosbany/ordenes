import React, { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { useProviders } from '@/hooks/useProviders';
import { processCsvImport } from '@/lib/utils/csvImport';
import { CsvImportResultsModal } from './CsvImportResultsModal';
import { toast } from 'react-hot-toast';

export function CsvImportCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const { products, loading: productsLoading } = useGlobalProducts();
  const { providers, loading: providersLoading } = useProviders();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('El archivo debe ser de tipo CSV');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const result = await processCsvImport(text, products, providers);
      
      setImportResult(result);
      setIsResultsModalOpen(true);

      // Show brief toast notification
      if (result.updated > 0) {
        toast.success(`${result.updated} productos actualizados`);
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (productsLoading || providersLoading) {
    return (
      <Card>
        <Card.Header className="!p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card.Header>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="!p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mt-1">Actualizar Precios</h3>
            </div>
            <div className="p-2 bg-violet-100 rounded-lg">
              <FileUp className="w-5 h-5 text-violet-600" />
            </div>
          </div>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={handleClick}
              isLoading={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Procesando...' : 'Seleccionar Archivo'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Formato: Fecha, RUT, Código, Nombre, Precio
            </p>
          </div>
        </Card.Header>
      </Card>

      <CsvImportResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        result={importResult}
      />
    </>
  );
}
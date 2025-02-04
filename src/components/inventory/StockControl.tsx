import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RefreshCw, Check, X } from 'lucide-react';
import { getZureoStock } from '@/lib/services/zureo/stockCheck';
import { toast } from 'react-hot-toast';

interface StockControlProps {
  productId: string;
  sku: string;
  currentStock: number;
  onStockUpdate: (newStock: number) => Promise<void>;
  isEnabled: boolean;
}

export function StockControl({ 
  productId, 
  sku, 
  currentStock, 
  onStockUpdate,
  isEnabled
}: StockControlProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [zureoStock, setZureoStock] = useState<number | null>(null);
  const [manualStock, setManualStock] = useState<string>('');
  const [showInput, setShowInput] = useState(false);

  const handleCheckStock = async () => {
    if (!sku) {
      toast.error('Este producto no tiene SKU definido');
      return;
    }

    if (!isEnabled) {
      toast.error('Debe autenticarse primero');
      return;
    }

    setIsChecking(true);
    const loadingToast = toast.loading('Consultando stock en Zureo...');

    try {
      const stock = await getZureoStock(sku);
      toast.dismiss(loadingToast);

      if (stock === null) {
        toast.error('No se pudo obtener el stock del artículo');
        return;
      }

      // Show the stock value and input field
      setZureoStock(stock);
      setManualStock(stock.toString());
      setShowInput(true);
      
      toast.success(`Stock consultado: ${stock}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      
      // Handle specific error messages with fallbacks
      let errorMessage = 'Error al consultar stock en Zureo';
      
      if (error instanceof Error) {
        if (error.message.includes('Sesión expirada')) {
          errorMessage = 'Sesión expirada. Por favor, autentíquese nuevamente';
        } else if (error.message.includes('servidor no está disponible') || 
                  error.message.includes('temporalmente no disponible')) {
          errorMessage = 'El servicio no está disponible. Por favor, intente más tarde';
        } else if (error.message.includes('No se encontró')) {
          errorMessage = `No se encontró el artículo ${sku}`;
        } else if (error.message.includes('Error al procesar')) {
          errorMessage = 'Error de comunicación con el servidor';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      console.error('Error checking stock:', {
        sku,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmStock = async () => {
    try {
      const newStock = parseInt(manualStock);
      if (isNaN(newStock) || newStock < 0) {
        toast.error('Ingrese un valor válido');
        return;
      }

      await onStockUpdate(newStock);
      toast.success('Stock actualizado exitosamente');
      
      // Reset state
      setZureoStock(null);
      setManualStock('');
      setShowInput(false);
    } catch (error) {
      toast.error('Error al actualizar el stock');
      console.error('Error updating stock:', error);
    }
  };

  const handleCancel = () => {
    setZureoStock(null);
    setManualStock('');
    setShowInput(false);
  };

  return (
    <div className="space-y-3">
      {showInput && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={manualStock}
            onChange={(e) => setManualStock(e.target.value)}
            placeholder="Ingrese cantidad"
            className="text-center"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleConfirmStock}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 w-9 h-9 p-0"
            title="Confirmar"
          >
            <Check className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 w-9 h-9 p-0"
            title="Cancelar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleCheckStock}
        disabled={isChecking || !sku || !isEnabled}
        className="w-full"
        title={!isEnabled ? 'Debe autenticarse primero' : ''}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
        Controlar Stock
      </Button>
    </div>
  );
}
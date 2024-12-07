import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { 
  getSectorFromOrder, 
  getSequenceFromOrder, 
  calculateNewOrder,
  formatOrderNumber 
} from '@/lib/order/utils';
import { getSectorColor } from '@/lib/sectorColors';
import { useProductOrder } from '@/hooks/useProductOrder';

interface ProductOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  products: Product[];
  onOrderChange: (newOrder: number) => void;
}

export function ProductOrderModal({
  isOpen,
  onClose,
  product,
  products,
  onOrderChange
}: ProductOrderModalProps) {
  const [selectedSector, setSelectedSector] = useState(getSectorFromOrder(product.order));
  const [selectedPosition, setSelectedPosition] = useState<number>(getSequenceFromOrder(product.order));
  const { updateOrder, isProcessing } = useProductOrder();

  // Get all products in selected sector (including current product)
  const sectorProducts = products
    .filter(p => getSectorFromOrder(p.order) === selectedSector)
    .sort((a, b) => getSequenceFromOrder(a.order) - getSequenceFromOrder(b.order));

  // Calculate max position based on current products in sector
  const maxPosition = sectorProducts.length;

  // Get adjacent products based on selected position
  const prevProduct = selectedPosition > 1 
    ? sectorProducts[selectedPosition - 2] 
    : null;
  const nextProduct = selectedPosition < maxPosition 
    ? sectorProducts[selectedPosition - 1]
    : null;

  const currentSectorColor = getSectorColor(getSectorFromOrder(product.order));
  const selectedSectorColor = getSectorColor(selectedSector);

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSector = e.target.value;
    setSelectedSector(newSector);
    
    // When changing sectors, set position to end of list
    const sectorProductCount = products.filter(p => 
      getSectorFromOrder(p.order) === newSector
    ).length;
    
    setSelectedPosition(sectorProductCount + 1);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newPosition = direction === 'prev' 
      ? Math.max(1, selectedPosition - 1)
      : Math.min(maxPosition, selectedPosition + 1);
    setSelectedPosition(newPosition);
  };

  const handleSubmit = async () => {
    if (isProcessing) return;
    
    try {
      const newOrder = calculateNewOrder(selectedSector, selectedPosition);
      await onOrderChange(newOrder);
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title="Cambiar orden del producto"
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className={`rounded-lg p-4 border ${currentSectorColor.bg} ${currentSectorColor.border}`}>
          <div className={`text-sm font-medium ${currentSectorColor.text}`}>{product.name}</div>
          <div className={`text-sm mt-1 ${currentSectorColor.text}`}>
            Orden actual: {formatOrderNumber(product.order)}
          </div>
        </div>

        {/* Sector Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select
            value={selectedSector}
            onChange={handleSectorChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={isProcessing}
          >
            {SECTORS.map(sector => {
              const sectorColor = getSectorColor(sector.code);
              return (
                <option 
                  key={sector.code} 
                  value={sector.code}
                  className={`${sectorColor.bg}`}
                >
                  {sector.code} - {sector.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Navigation Controls */}
        <div className={`rounded-lg border p-4 ${selectedSectorColor.bg} ${selectedSectorColor.border}`}>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('prev')}
              disabled={selectedPosition <= 1 || isProcessing}
              className={`
                h-12 w-12 rounded-full flex items-center justify-center transition-colors
                ${selectedPosition <= 1 || isProcessing
                  ? 'bg-white/50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-white/80'
                }
              `}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <div className="bg-white rounded-lg py-3 shadow-sm">
                <div className="text-center">
                  <span className="text-2xl font-bold">
                    {selectedPosition}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    de {maxPosition}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('next')}
              disabled={selectedPosition >= maxPosition || isProcessing}
              className={`
                h-12 w-12 rounded-full flex items-center justify-center transition-colors
                ${selectedPosition >= maxPosition || isProcessing
                  ? 'bg-white/50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-white/80'
                }
              `}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Adjacent Products */}
        <div className="grid grid-cols-2 gap-4">
          {/* Previous Product */}
          <div className={`rounded-lg p-4 ${prevProduct ? 'border bg-white' : 'bg-gray-50 border-2 border-dashed'}`}>
            <div className="text-xs text-gray-500 mb-1">Anterior</div>
            {prevProduct ? (
              <>
                <div className="text-sm font-medium text-gray-900 mb-1">{prevProduct.name}</div>
                <div className={`text-xs ${selectedSectorColor.text}`}>
                  {getSequenceFromOrder(prevProduct.order)}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">No hay producto anterior</div>
            )}
          </div>

          {/* Next Product */}
          <div className={`rounded-lg p-4 ${nextProduct ? 'border bg-white' : 'bg-gray-50 border-2 border-dashed'}`}>
            <div className="text-xs text-gray-500 mb-1">Siguiente</div>
            {nextProduct ? (
              <>
                <div className="text-sm font-medium text-gray-900 mb-1">{nextProduct.name}</div>
                <div className={`text-xs ${selectedSectorColor.text}`}>
                  {getSequenceFromOrder(nextProduct.order)}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">No hay producto siguiente</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
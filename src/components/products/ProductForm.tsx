import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/ui/TagInput';
import { ArrowUpDown } from 'lucide-react';
import { Product } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { usePackaging } from '@/hooks/usePackaging';
import { useProducts } from '@/hooks/useProducts';
import { validateProductStock, showValidationError } from '@/lib/validation';
import { ProductOrderModal } from './ProductOrderModal';
import { formatOrderNumber } from '@/lib/order/utils';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/order/utils';
import { SECTORS } from '@/config/constants';
import { getSectorColor } from '@/lib/sectorColors';

interface ProductFormProps {
  providerId: string;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({
  providerId: initialProviderId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const { providers } = useProviders();
  const { packagingSuggestions, addPackaging } = usePackaging();
  const { products } = useProducts(initialProviderId);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: initialData?.name?.toUpperCase() || '',
    sku: initialData?.sku || '',
    purchasePackaging: initialData?.purchasePackaging?.toUpperCase() || '',
    salePackaging: initialData?.salePackaging?.toUpperCase() || '',
    order: initialData?.order || (() => {
      const firstSector = SECTORS[0].code;
      const sectorProducts = products.filter(p => getSectorFromOrder(p.order) === firstSector);
      return calculateNewOrder(firstSector, sectorProducts.length + 1);
    })(),
    price: initialData?.price || 0,
    desiredStock: initialData?.desiredStock || 0,
    minPackageStock: initialData?.minPackageStock || 0,
    providerId: initialData?.providerId || initialProviderId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stockValidation = validateProductStock(formData.minPackageStock, formData.desiredStock);
    if (stockValidation) {
      showValidationError(stockValidation);
      return;
    }

    await onSubmit(formData);
  };

  const handleOrderChange = async (product: Product, newOrder: number) => {
    setFormData(prev => ({ ...prev, order: newOrder }));
    setIsOrderModalOpen(false);
  };

  const sectorColor = getSectorColor(getSectorFromOrder(formData.order));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre del producto"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            name: e.target.value.toUpperCase() 
          }))}
          required
        />

        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            sku: e.target.value.toUpperCase() 
          }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TagInput
          label="Empaque de Compra"
          value={formData.purchasePackaging}
          onChange={async (packaging) => {
            setFormData(prev => ({ ...prev, purchasePackaging: packaging.toUpperCase() }));
            if (!packagingSuggestions.includes(packaging.toUpperCase())) {
              await addPackaging(packaging);
            }
          }}
          onRemove={() => setFormData(prev => ({ ...prev, purchasePackaging: '' }))}
          suggestions={packagingSuggestions}
          placeholder="Escriba y presione Enter"
        />

        <TagInput
          label="Empaque de Venta"
          value={formData.salePackaging}
          onChange={async (packaging) => {
            setFormData(prev => ({ ...prev, salePackaging: packaging.toUpperCase() }));
            if (!packagingSuggestions.includes(packaging.toUpperCase())) {
              await addPackaging(packaging);
            }
          }}
          onRemove={() => setFormData(prev => ({ ...prev, salePackaging: '' }))}
          suggestions={packagingSuggestions}
          placeholder="Escriba y presione Enter"
        />
      </div>

      {/* Order Display */}
      <div 
        className={`rounded-lg p-4 border cursor-pointer transition-colors ${sectorColor.bg} ${sectorColor.border} hover:opacity-90`}
        onClick={() => setIsOrderModalOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div>
            <label className={`text-sm font-medium ${sectorColor.text}`}>
              Orden del Producto
            </label>
            <div className={`text-lg font-bold mt-1 ${sectorColor.text}`}>
              {formatOrderNumber(formData.order)}
            </div>
          </div>
          <ArrowUpDown className={`w-5 h-5 ${sectorColor.text}`} />
        </div>
      </div>

      <Input
        label="Precio"
        value={formData.price}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          price: parseFloat(e.target.value) || 0 
        }))}
        min={0}
        required
        isCurrency
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock mínimo"
          type="number"
          value={formData.minPackageStock}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            minPackageStock: parseInt(e.target.value) || 0 
          }))}
          min={0}
          required
        />

        <Input
          label="Stock deseado"
          type="number"
          value={formData.desiredStock}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            desiredStock: parseInt(e.target.value) || 0 
          }))}
          min={0}
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>

      {initialData && (
        <ProductOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={initialData}
          products={products}
          onOrderChange={handleOrderChange}
        />
      )}
    </form>
  );
}
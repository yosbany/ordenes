import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/ui/TagInput';
import { TagsInput } from '@/components/ui/TagsInput';
import { ArrowUpDown } from 'lucide-react';
import { Product } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { usePackaging } from '@/hooks/usePackaging';
import { useTags } from '@/hooks/useTags';
import { useProducts } from '@/hooks/useProducts';
import { useSkuSuggestion } from '@/hooks/useSkuSuggestion';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductOrderModal } from './ProductOrderModal';
import { formatOrderNumber } from '@/lib/order/utils';
import { getSectorFromOrder } from '@/lib/order/utils';
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
  const { tags: tagSuggestions, addTag } = useTags();
  const { products } = useProducts(initialProviderId);
  const { suggestedSku, loading: skuLoading } = useSkuSuggestion();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const {
    formData,
    updateField,
    handleProviderChange,
    handleSubmit,
    isSubmitting,
    errors
  } = useProductForm({
    initialData,
    providerId: initialProviderId,
    onSubmit
  });

  const handleOrderChange = async (product: Product, newOrder: number) => {
    updateField('order', newOrder);
    setIsOrderModalOpen(false);
  };

  const handleTagsChange = async (tags: string[]) => {
    updateField('tags', tags);
    
    // Add any new tags to the suggestions
    const newTags = tags.filter(tag => !tagSuggestions.includes(tag));
    for (const tag of newTags) {
      await addTag(tag);
    }
  };

  const sectorColor = getSectorColor(getSectorFromOrder(formData.order));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <Input
        label="Nombre del producto"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value.toUpperCase())}
        error={errors.name}
        required
      />

      {/* SKU */}
      <div className="space-y-2">
        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
          error={errors.sku}
          required
        />
        {!initialData && !skuLoading && suggestedSku && (
          <p className="text-sm text-blue-600">
            SKU sugerido: {suggestedSku}
          </p>
        )}
      </div>

      {/* Provider and Supplier Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Proveedor</label>
          <select
            value={formData.providerId}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.commercialName}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Código de proveedor"
          value={formData.supplierCode}
          onChange={(e) => updateField('supplierCode', e.target.value.toUpperCase())}
          placeholder="Código asignado por el proveedor"
        />
      </div>

      {/* Packaging */}
      <div className="grid grid-cols-2 gap-4">
        <TagInput
          label="Empaque de Compra"
          value={formData.purchasePackaging}
          onChange={async (packaging) => {
            updateField('purchasePackaging', packaging.toUpperCase());
            if (!packagingSuggestions.includes(packaging.toUpperCase())) {
              await addPackaging(packaging);
            }
          }}
          onRemove={() => updateField('purchasePackaging', '')}
          suggestions={packagingSuggestions}
          placeholder="Escriba y presione Enter"
          error={errors.purchasePackaging}
          required
        />

        <TagInput
          label="Empaque de Venta (opcional)"
          value={formData.salePackaging}
          onChange={async (packaging) => {
            updateField('salePackaging', packaging.toUpperCase());
            if (!packagingSuggestions.includes(packaging.toUpperCase())) {
              await addPackaging(packaging);
            }
          }}
          onRemove={() => updateField('salePackaging', '')}
          suggestions={packagingSuggestions}
          placeholder="Escriba y presione Enter"
          error={errors.salePackaging}
        />
      </div>

      {/* Tags */}
      <TagsInput
        label="Etiquetas"
        value={formData.tags}
        onChange={handleTagsChange}
        suggestions={tagSuggestions}
      />

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

      {/* Price */}
      <Input
        label="Precio"
        value={formData.price}
        onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
        error={errors.price}
        min={0}
        required
        isCurrency
      />

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock mínimo"
          type="number"
          value={formData.minPackageStock}
          onChange={(e) => updateField('minPackageStock', parseInt(e.target.value) || 0)}
          error={errors.minPackageStock}
          min={0}
          required
        />

        <Input
          label="Stock deseado"
          type="number"
          value={formData.desiredStock}
          onChange={(e) => updateField('desiredStock', parseInt(e.target.value) || 0)}
          error={errors.desiredStock}
          min={0}
          required
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading || isSubmitting}>
          {initialData ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>

      {/* Order Modal */}
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
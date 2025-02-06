import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagsInput } from '@/components/ui/TagsInput';
import { MeasureSelect } from '@/components/ui/MeasureSelect';
import { ArrowUpDown, ChefHat } from 'lucide-react';
import { Product } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { useTags } from '@/hooks/useTags';
import { getSectorFromOrder, formatOrderNumber } from '@/lib/utils';
import { getSectorColor } from '@/lib/sectorColors';

interface ProductFormProps {
  providerId: string;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ProductForm({
  providerId: initialProviderId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  onDirtyChange
}: ProductFormProps) {
  const { providers } = useProviders();
  const { tags: tagSuggestions, addTag } = useTags();
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    supplierCode: initialData?.supplierCode || '',
    purchasePackaging: initialData?.purchasePackaging || '',
    salePackaging: initialData?.salePackaging || '',
    order: initialData?.order || 0,
    price: initialData?.price || 0,
    desiredStock: initialData?.desiredStock || 0,
    minPackageStock: initialData?.minPackageStock || 0,
    providerId: initialData?.providerId || initialProviderId,
    tags: initialData?.tags || [],
    isProduction: initialData?.isProduction || false,
    unitMeasure: initialData?.unitMeasure || 'UNIDAD',
    pricePerUnit: initialData?.pricePerUnit || 0
  });

  const updateField = <K extends keyof Omit<Product, 'id'>>(
    field: K,
    value: Omit<Product, 'id'>[K]
  ) => {
    setFormData(prev => {
      const updates: Partial<Omit<Product, 'id'>> = { [field]: value };
      
      // If toggling isProduction, set default unitMeasure
      if (field === 'isProduction' && value === true) {
        updates.unitMeasure = prev.unitMeasure || 'UNIDAD';
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    updateField('name', e.target.value.toUpperCase());
  };

  const sectorColor = getSectorColor(getSectorFromOrder(formData.order));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Información Básica</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre del producto"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={handleNameBlur}
              required
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Proveedor</label>
              <select
                value={formData.providerId}
                onChange={(e) => updateField('providerId', e.target.value)}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <MeasureSelect
              label="Empaque de Compra"
              value={formData.purchasePackaging}
              onChange={(value) => updateField('purchasePackaging', value)}
              required
              placeholder="Seleccionar empaque de compra"
            />

            <MeasureSelect
              label="Empaque de Venta"
              value={formData.salePackaging}
              onChange={(value) => updateField('salePackaging', value)}
              placeholder="Seleccionar empaque de venta"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Material de Producción</Card.Title>
        </Card.Header>
        <Card.Content>
          <fieldset>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isProduction"
                checked={formData.isProduction}
                onChange={(e) => updateField('isProduction', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isProduction" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Material de producción
              </label>
            </div>

            {formData.isProduction && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MeasureSelect
                  label="Unidad de Medida"
                  value={formData.unitMeasure || 'UNIDAD'}
                  onChange={(value) => updateField('unitMeasure', value)}
                  required
                  placeholder="Seleccionar unidad de medida"
                />
                <Input
                  label="Precio por Unidad"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => updateField('pricePerUnit', parseFloat(e.target.value) || 0)}
                  min={0}
                  step="0.01"
                  required
                  isCurrency
                />
              </div>
            )}
          </fieldset>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Etiquetas y Orden</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <TagsInput
            label="Etiquetas"
            value={formData.tags}
            onChange={async (tags) => {
              updateField('tags', tags);
              for (const tag of tags) {
                if (!tagSuggestions.includes(tag)) {
                  await addTag(tag);
                }
              }
            }}
            suggestions={tagSuggestions}
          />

          <div 
            className={`rounded-lg p-4 border ${sectorColor.bg} ${sectorColor.border}`}
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
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Precio y Stock</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label="Precio"
            value={formData.price}
            onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
            min={0}
            required
            isCurrency
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock mínimo"
              type="number"
              value={formData.minPackageStock}
              onChange={(e) => updateField('minPackageStock', parseInt(e.target.value) || 0)}
              min={0}
              required
            />

            <Input
              label="Stock deseado"
              type="number"
              value={formData.desiredStock}
              onChange={(e) => updateField('desiredStock', parseInt(e.target.value) || 0)}
              min={0}
              required
            />
          </div>
        </Card.Content>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
}
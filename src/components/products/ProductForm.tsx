import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagsInput } from '@/components/ui/TagsInput';
import { MeasureSelect } from '@/components/ui/MeasureSelect';
import { AlertTriangle, ArrowUpDown, ChefHat, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { useTags } from '@/hooks/useTags';
import { useSkuSuggestion } from '@/hooks/useSkuSuggestion';
import { useUnitMeasures } from '@/hooks/useUnitMeasures';
import { useUnitConversions } from '@/hooks/useUnitConversions';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { getSectorFromOrder, formatOrderNumber, formatPrice } from '@/lib/utils';
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
  const { suggestedSku } = useSkuSuggestion();
  const { unitMeasures, loading: measuresLoading } = useUnitMeasures();
  const { conversions: unitConversions, loading: conversionsLoading } = useUnitConversions();
  const { orders } = useGlobalOrders();

  const averageOrderQuantity = useMemo(() => {
    if (!initialData?.id) return 0;

    const productOrders = orders.filter(order => 
      order.items.some(item => item.productId === initialData.id)
    );

    if (productOrders.length === 0) return 0;

    const totalQuantity = productOrders.reduce((sum, order) => {
      const item = order.items.find(item => item.productId === initialData.id);
      return sum + (item?.quantity || 0);
    }, 0);

    return Number((totalQuantity / productOrders.length).toFixed(1));
  }, [orders, initialData?.id]);

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
    unitMeasure: initialData?.unitMeasure || '',
    pricePerUnit: initialData?.pricePerUnit || 0,
    forSale: initialData?.forSale || false,
    saleUnit: initialData?.saleUnit || '',
    salePrice: initialData?.salePrice || 0,
    averageOrderQuantity
  });

  const unitCost = useMemo(() => {
    if (!formData.price || !formData.purchasePackaging || !formData.saleUnit) {
      return 0;
    }

    if (formData.purchasePackaging === formData.saleUnit) {
      return formData.price;
    }

    const conversion = unitConversions?.find(c => 
      (c.fromUnit === formData.purchasePackaging && c.toUnit === formData.saleUnit) ||
      (c.fromUnit === formData.saleUnit && c.toUnit === formData.purchasePackaging)
    );

    if (!conversion) {
      return 0;
    }

    if (conversion.fromUnit === formData.purchasePackaging) {
      return Number((formData.price / conversion.factor).toFixed(2));
    } else {
      return Number((formData.price * conversion.factor).toFixed(2));
    }
  }, [formData.price, formData.purchasePackaging, formData.saleUnit, unitConversions]);

  const productionUnitCost = useMemo(() => {
    if (!formData.price || !formData.purchasePackaging || !formData.unitMeasure) {
      return 0;
    }

    if (formData.purchasePackaging === formData.unitMeasure) {
      return formData.price;
    }

    const conversion = unitConversions?.find(c => 
      (c.fromUnit === formData.purchasePackaging && c.toUnit === formData.unitMeasure) ||
      (c.fromUnit === formData.unitMeasure && c.toUnit === formData.purchasePackaging)
    );

    if (!conversion) {
      return 0;
    }

    if (conversion.fromUnit === formData.purchasePackaging) {
      return Number((formData.price / conversion.factor).toFixed(2));
    } else {
      return Number((formData.price * conversion.factor).toFixed(2));
    }
  }, [formData.price, formData.purchasePackaging, formData.unitMeasure, unitConversions]);

  const profitMargin = useMemo(() => {
    if (!formData.salePrice || !unitCost) return 0;
    return ((formData.salePrice - unitCost) / formData.salePrice) * 100;
  }, [formData.salePrice, unitCost]);

  useEffect(() => {
    if (formData.isProduction && productionUnitCost > 0) {
      setFormData(prev => ({
        ...prev,
        pricePerUnit: productionUnitCost
      }));
    }
  }, [productionUnitCost, formData.isProduction]);

  useEffect(() => {
    if (!formData.isProduction) {
      setFormData(prev => ({
        ...prev,
        pricePerUnit: 0,
        unitMeasure: ''
      }));
    }
  }, [formData.isProduction]);

  const updateField = <K extends keyof Omit<Product, 'id'>>(
    field: K,
    value: Omit<Product, 'id'>[K]
  ) => {
    setFormData(prev => {
      const updates: Partial<Omit<Product, 'id'>> = { [field]: value };
      
      if (field === 'isProduction' && value === true) {
        updates.unitMeasure = prev.unitMeasure || 'UNIDAD';
      }
      
      return { ...prev, ...updates };
    });

    onDirtyChange?.(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    updateField('name', e.target.value.toUpperCase());
  };

  const sectorColor = getSectorColor(getSectorFromOrder(formData.order));

  if (measuresLoading || conversionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

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
              label={!initialData && suggestedSku ? `SKU (Sugerido: ${suggestedSku})` : "SKU"}
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

          <div>
            <MeasureSelect
              label="Empaque de Compra"
              value={formData.purchasePackaging}
              onChange={(value) => updateField('purchasePackaging', value)}
              required
              placeholder="Seleccionar empaque de compra"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Configuración de Venta</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="forSale"
                checked={formData.forSale}
                onChange={(e) => updateField('forSale', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="forSale" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Producto para venta
              </label>
            </div>

            {formData.forSale && (
              <div className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <Input
                      label="SKU"
                      value={formData.sku}
                      onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                      placeholder="Ej: P-001"
                    />

                    <MeasureSelect
                      label="Unidad de Venta"
                      value={formData.saleUnit}
                      onChange={(value) => updateField('saleUnit', value)}
                      required
                      placeholder="Seleccionar unidad de venta"
                    />

                    <Input
                      label="Precio de Venta"
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => updateField('salePrice', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      required
                      isCurrency
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Costo Unitario</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {formData.purchasePackaging === formData.saleUnit ? (
                          formatPrice(formData.price)
                        ) : unitCost > 0 ? (
                          formatPrice(unitCost)
                        ) : (
                          <span className="text-amber-600 text-base">
                            No hay conversión disponible entre {formData.purchasePackaging} y {formData.saleUnit}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Por {formData.saleUnit || 'unidad'}
                      </div>
                    </div>

                    {formData.salePrice > 0 && (formData.purchasePackaging === formData.saleUnit || unitCost > 0) && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Margen de Ganancia</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                          {profitMargin.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(formData.salePrice - (formData.purchasePackaging === formData.saleUnit ? formData.price : unitCost))} por {formData.saleUnit}
                        </div>
                      </div>
                    )}

                    {formData.saleUnit && formData.purchasePackaging !== formData.saleUnit && !unitCost && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <div className="text-sm">
                          Agregue una conversión entre <strong>{formData.purchasePackaging}</strong> y <strong>{formData.saleUnit}</strong> en la gestión de unidades
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Material de Producción</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
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
                <div className="space-y-4">
                  <MeasureSelect
                    label="Unidad de Medida"
                    value={formData.unitMeasure || 'UNIDAD'}
                    onChange={(value) => updateField('unitMeasure', value)}
                    required
                    placeholder="Seleccionar unidad de medida"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Costo por Unidad</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {formData.purchasePackaging === formData.unitMeasure ? (
                        formatPrice(formData.price)
                      ) : productionUnitCost > 0 ? (
                        formatPrice(productionUnitCost)
                      ) : (
                        <span className="text-amber-600 text-base">
                          No hay conversión disponible entre {formData.purchasePackaging} y {formData.unitMeasure}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Por {formData.unitMeasure || 'unidad'}
                    </div>
                  </div>

                  {formData.unitMeasure && formData.purchasePackaging !== formData.unitMeasure && !productionUnitCost && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mt-3">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <div className="text-sm">
                        Agregue una conversión entre <strong>{formData.purchasePackaging}</strong> y <strong>{formData.unitMeasure}</strong> en la gestión de unidades
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
        <Card.Content className="space-y-6">
          <div className="space-y-2">
            <Input
              label={`Precio de Compra (por ${formData.purchasePackaging || 'unidad'})`}
              value={formData.price}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              min={0}
              required
              isCurrency
            />
            <p className="text-sm text-gray-500">
              Este es el precio de compra según el empaque de compra especificado
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label={`Stock Mínimo (${formData.purchasePackaging || 'unidades'})`}
                type="number"
                value={formData.minPackageStock}
                onChange={(e) => updateField('minPackageStock', parseInt(e.target.value) || 0)}
                min={0}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nivel mínimo de stock en empaques de compra
              </p>
            </div>

            <div>
              <Input
                label={`Stock Deseado (${formData.purchasePackaging || 'unidades'})`}
                type="number"
                value={formData.desiredStock}
                onChange={(e) => updateField('desiredStock', parseInt(e.target.value) || 0)}
                min={0}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nivel óptimo de stock en empaques de compra
              </p>
            </div>

            <div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-700">
                  Stock Promedio
                </label>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {averageOrderQuantity} {formData.purchasePackaging}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Promedio de compra por orden
                </p>
                {averageOrderQuantity > 0 && averageOrderQuantity < formData.desiredStock && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>
                      El promedio está por debajo del stock deseado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.minPackageStock > formData.desiredStock && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <div className="text-sm">
                El stock mínimo no puede ser mayor al stock deseado
              </div>
            </div>
          )}
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
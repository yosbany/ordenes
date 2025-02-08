import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagsInput } from '@/components/ui/TagsInput';
import { MeasureSelect } from '@/components/ui/MeasureSelect';
import { Calculator, Info, AlertTriangle, ChefHat, ShoppingCart, Package, FileText } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/types';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { useFixedCosts } from '@/hooks/useFixedCosts';
import { calculateRecipeCosts } from '@/lib/recipes/calculations';
import { formatPrice } from '@/lib/utils';
import { MaterialList } from './MaterialList';
import { MaterialSelector } from './MaterialSelector';

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  recipes: Recipe[];
}

export function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  onDirtyChange,
  recipes
}: RecipeFormProps) {
  const { products } = useGlobalProducts();
  const { currentCosts } = useFixedCosts();
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    name: initialData?.name || '',
    yield: initialData?.yield || 0,
    yieldUnit: initialData?.yieldUnit || '',
    materials: initialData?.materials || [],
    fixedCostPercentage: currentCosts?.fixedCostPercentage || 
                        initialData?.fixedCostPercentage || 
                        (recipes.length > 0 ? recipes[0].fixedCostPercentage : 15),
    profitPercentage: initialData?.profitPercentage || 90,
    notes: initialData?.notes || '',
    totalCost: initialData?.totalCost || 0,
    unitCost: initialData?.unitCost || 0,
    suggestedPrice: initialData?.suggestedPrice || 0,
    lastUpdated: Date.now(),
    costHistory: initialData?.costHistory || [],
    costThreshold: initialData?.costThreshold || 20,
    isBase: initialData?.isBase || false,
    forSale: initialData?.forSale || false,
    sku: initialData?.sku || '',
    salePrice: initialData?.salePrice || 0
  });

  // Update costs whenever materials, yield, or fixed cost percentage changes
  useEffect(() => {
    if (formData.materials.length > 0 && formData.yield > 0) {
      const costs = calculateRecipeCosts(
        formData.materials,
        products,
        recipes,
        formData.yield,
        formData.fixedCostPercentage,
        formData.profitPercentage,
        initialData?.unitCost
      );

      setFormData(prev => ({
        ...prev,
        totalCost: costs.totalCost,
        unitCost: costs.unitCost,
        suggestedPrice: costs.suggestedPrice,
        costHistory: costs.costHistory 
          ? [...(prev.costHistory || []), ...costs.costHistory]
          : prev.costHistory
      }));
    }
  }, [
    formData.materials, 
    formData.yield, 
    formData.fixedCostPercentage,
    formData.profitPercentage,
    products,
    recipes,
    initialData?.unitCost
  ]);

  // Update fixed cost percentage when currentCosts changes
  useEffect(() => {
    if (currentCosts?.fixedCostPercentage && !initialData) {
      setFormData(prev => ({
        ...prev,
        fixedCostPercentage: currentCosts.fixedCostPercentage
      }));
    }
  }, [currentCosts, initialData]);

  const updateField = <K extends keyof Omit<Recipe, 'id'>>(
    field: K,
    value: Omit<Recipe, 'id'>[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDirtyChange?.(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleAddMaterial = (material: { id: string; type: 'product' | 'recipe' }, quantity: number) => {
    const materialToAdd = material.type === 'product' 
      ? products.find(p => p.id === material.id)
      : recipes.find(r => r.id === material.id);

    if (!materialToAdd) return;

    const unitCost = material.type === 'product'
      ? (materialToAdd as Product).pricePerUnit || 0
      : (materialToAdd as Recipe).unitCost;

    const totalCost = quantity * unitCost;

    const newMaterial = {
      id: material.id,
      type: material.type,
      quantity,
      unit: material.type === 'product' 
        ? (materialToAdd as Product).unitMeasure || (materialToAdd as Product).purchasePackaging
        : (materialToAdd as Recipe).yieldUnit,
      unitCost,
      totalCost
    };

    updateField('materials', [...formData.materials, newMaterial]);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...formData.materials];
    newMaterials.splice(index, 1);
    updateField('materials', newMaterials);
  };

  // Calculate current profit margin based on sale price and unit cost
  const currentProfitMargin = formData.salePrice > 0 && formData.unitCost > 0
    ? ((formData.salePrice - formData.unitCost) / formData.unitCost * 100)
    : 0;

  // Calculate suggested price using the formula:
  // Suggested Price = Unit Cost / (1 - (Profit Percentage / 100))
  const calculatedSuggestedPrice = formData.unitCost > 0
    ? formData.unitCost / (1 - (formData.profitPercentage / 100))
    : 0;

  // Check if current sale price deviates significantly from suggested price
  const priceDeviation = formData.salePrice > 0 && calculatedSuggestedPrice > 0
    ? Math.abs((formData.salePrice - calculatedSuggestedPrice) / calculatedSuggestedPrice * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <Card.Header>
          <Card.Title>Información Básica</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label="Nombre de la receta"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Rendimiento"
              type="number"
              value={formData.yield}
              onChange={(e) => updateField('yield', parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              required
            />

            <MeasureSelect
              label="Unidad de rendimiento"
              value={formData.yieldUnit}
              onChange={(value) => updateField('yieldUnit', value)}
              required
              placeholder="Seleccionar unidad..."
            />
          </div>
        </Card.Content>
      </Card>

      {/* Recipe Type */}
      <Card>
        <Card.Header>
          <Card.Title>Tipo de Receta</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBase"
                  checked={formData.isBase}
                  onChange={(e) => updateField('isBase', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isBase" className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <ChefHat className="w-4 h-4" />
                  Receta base
                </label>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Las recetas base son utilizadas como materiales en otras recetas
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forSale"
                  checked={formData.forSale}
                  onChange={(e) => updateField('forSale', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="forSale" className="flex items-center gap-2 text-sm font-medium text-blue-900">
                  <ShoppingCart className="w-4 h-4" />
                  Receta para venta
                </label>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Habilita la configuración de precios y SKU para venta
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Materials Section */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <Card.Title>Materiales</Card.Title>
              <p className="text-sm text-gray-500 mt-1">
                Gestión de materiales y cantidades
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content className="space-y-6">
          {/* Material Selector */}
          <MaterialSelector
            products={products}
            recipes={recipes}
            onSelect={handleAddMaterial}
            selectedMaterials={formData.materials.map(m => m.id)}
          />

          {/* Materials List */}
          <MaterialList
            materials={formData.materials}
            products={products}
            recipes={recipes}
            onRemove={handleRemoveMaterial}
          />
        </Card.Content>
      </Card>

      {/* Costs and Pricing */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <Card.Title>Costos y Precios</Card.Title>
              <p className="text-sm text-gray-500 mt-1">
                Gestión de costos, márgenes y precios de venta
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content className="space-y-6">
          {/* Cost Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Fixed Costs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Costos Fijos</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formData.fixedCostPercentage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Porcentaje aplicado
              </div>
            </div>

            {/* Total Cost */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Costo Total
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(formData.totalCost)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Materiales + Fijos
              </div>
            </div>

            {/* Unit Cost */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Costo Unitario
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(formData.unitCost)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Por {formData.yieldUnit || 'unidad'}
              </div>
            </div>
          </div>

          {/* Sales Configuration */}
          {formData.forSale && (
            <div className="border-t pt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* First Column - SKU and Sale Price */}
                <div className="space-y-4">
                  {/* SKU moved above sale price */}
                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                    placeholder="Ej: REC-001"
                  />

                  <Input
                    label="Precio de Venta"
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => updateField('salePrice', parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.01"
                    isCurrency
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Beneficio Objetivo
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          type="number"
                          value={formData.profitPercentage}
                          onChange={(e) => updateField('profitPercentage', parseFloat(e.target.value) || 0)}
                          min={0}
                          max={500}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Analysis - Second Column */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {/* Current Margin */}
                  <div>
                    <div className="text-sm font-medium text-gray-700">Margen Actual</div>
                    <div className={`text-2xl font-bold mt-1 ${
                      currentProfitMargin >= formData.profitPercentage
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}>
                      {currentProfitMargin.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(formData.salePrice - formData.unitCost)} por {formData.yieldUnit}
                    </div>
                  </div>

                  {/* Suggested Price */}
                  <div>
                    <div className="text-sm font-medium text-gray-700">Precio Sugerido</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {formatPrice(calculatedSuggestedPrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Para {formData.profitPercentage}% de beneficio
                    </div>
                  </div>

                  {/* Price Deviation Warning */}
                  {priceDeviation > 10 && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        El precio actual se desvía un {priceDeviation.toFixed(1)}% del sugerido
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Notes Section */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <Card.Title>Notas</Card.Title>
              <p className="text-sm text-gray-500 mt-1">
                Instrucciones y observaciones de la receta
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Escribe las instrucciones y notas de la receta aquí..."
          />
        </Card.Content>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Crear'} Receta
        </Button>
      </div>
    </form>
  );
}
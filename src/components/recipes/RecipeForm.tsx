import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { useFixedCosts } from '@/hooks/useFixedCosts';
import { MaterialSelector } from './MaterialSelector';
import { MaterialList } from './MaterialList';
import { calculateRecipeCosts } from '@/lib/recipes/calculations';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  recipes: Recipe[];
}

export function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  recipes
}: RecipeFormProps) {
  const { products, loading: productsLoading } = useGlobalProducts();
  const { currentCosts } = useFixedCosts();
  const [formState, setFormState] = useState<Omit<Recipe, 'id'>>({
    name: initialData?.name || '',
    yield: initialData?.yield || 0,
    yieldUnit: initialData?.yieldUnit || '',
    materials: initialData?.materials || [],
    fixedCostPercentage: initialData?.fixedCostPercentage || 15,
    profitPercentage: initialData?.profitPercentage || 90,
    notes: initialData?.notes || '',
    totalCost: initialData?.totalCost || 0,
    unitCost: initialData?.unitCost || 0,
    suggestedPrice: initialData?.suggestedPrice || 0,
    lastUpdated: Date.now(),
    costHistory: initialData?.costHistory || [],
    costThreshold: initialData?.costThreshold || 20,
    isBase: initialData?.isBase || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate products
    if (formState.materials.length === 0) {
      toast.error('Debe agregar al menos un material');
      return;
    }

    if (!formState.name || !formState.yield || !formState.yieldUnit) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    await onSubmit(formState);
  };

  const handleAddMaterial = (material: { id: string; type: 'product' | 'recipe' }, quantity: number) => {
    if (material.type === 'product') {
      const product = products.find(p => p.id === material.id);
      if (!product) return;

      const unitCost = product.pricePerUnit || 0;
      const totalCost = unitCost * quantity;

      setFormState(prev => {
        const materials = [...prev.materials, {
          id: material.id,
          type: 'product',
          quantity,
          unit: product.unitMeasure || product.purchasePackaging,
          unitCost,
          totalCost
        }];

        const costs = calculateRecipeCosts(
          materials,
          products,
          recipes,
          prev.yield,
          prev.fixedCostPercentage,
          prev.profitPercentage,
          prev.unitCost
        );

        return {
          ...prev,
          materials,
          totalCost: costs.totalCost,
          unitCost: costs.unitCost,
          suggestedPrice: costs.suggestedPrice,
          costHistory: costs.costHistory 
            ? [...(prev.costHistory || []), ...costs.costHistory]
            : prev.costHistory
        };
      });
    } else {
      const recipe = recipes.find(r => r.id === material.id);
      if (!recipe) return;

      const unitCost = recipe.unitCost;
      const totalCost = unitCost * quantity;

      setFormState(prev => {
        const materials = [...prev.materials, {
          id: material.id,
          type: 'recipe',
          quantity,
          unit: recipe.yieldUnit,
          unitCost,
          totalCost
        }];

        const costs = calculateRecipeCosts(
          materials,
          products,
          recipes,
          prev.yield,
          prev.fixedCostPercentage,
          prev.profitPercentage,
          prev.unitCost
        );

        return {
          ...prev,
          materials,
          totalCost: costs.totalCost,
          unitCost: costs.unitCost,
          suggestedPrice: costs.suggestedPrice,
          costHistory: costs.costHistory 
            ? [...(prev.costHistory || []), ...costs.costHistory]
            : prev.costHistory
        };
      });
    }
  };

  if (productsLoading) {
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
          <Input
            label="Nombre de la receta"
            value={formState.name}
            onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Rendimiento"
              value={formState.yield}
              onChange={(e) => setFormState(prev => {
                const yield_ = Number(e.target.value);
                const costs = calculateRecipeCosts(
                  prev.materials,
                  products,
                  recipes,
                  yield_,
                  prev.fixedCostPercentage,
                  prev.profitPercentage,
                  prev.unitCost
                );

                return {
                  ...prev,
                  yield: yield_,
                  totalCost: costs.totalCost,
                  unitCost: costs.unitCost,
                  suggestedPrice: costs.suggestedPrice,
                  costHistory: costs.costHistory 
                    ? [...(prev.costHistory || []), ...costs.costHistory]
                    : prev.costHistory
                };
              })}
              min={0}
              step="0.01"
              required
            />

            <Input
              label="Unidad"
              value={formState.yieldUnit}
              onChange={(e) => setFormState(prev => ({ 
                ...prev, 
                yieldUnit: e.target.value.toUpperCase() 
              }))}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isBase"
              checked={formState.isBase}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                isBase: e.target.checked
              }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isBase" className="text-sm font-medium text-gray-700">
              Receta base (puede usarse como material en otras recetas)
            </label>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Materiales</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <MaterialSelector
            products={products}
            recipes={recipes}
            onSelect={handleAddMaterial}
            selectedMaterials={formState.materials.map(m => m.id)}
          />
          <MaterialList
            materials={formState.materials}
            products={products}
            recipes={recipes}
            onRemove={(index) => {
              setFormState(prev => {
                const materials = prev.materials.filter((_, i) => i !== index);
                const costs = calculateRecipeCosts(
                  materials,
                  products,
                  recipes,
                  prev.yield,
                  prev.fixedCostPercentage,
                  prev.profitPercentage,
                  prev.unitCost
                );

                return {
                  ...prev,
                  materials,
                  totalCost: costs.totalCost,
                  unitCost: costs.unitCost,
                  suggestedPrice: costs.suggestedPrice,
                  costHistory: costs.costHistory 
                    ? [...(prev.costHistory || []), ...costs.costHistory]
                    : prev.costHistory
                };
              });
            }}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Configuración de Costos</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-6">
            {/* Cost Configuration Section */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Fixed Cost */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-blue-700">Costo Fijo:</div>
                  <div className="text-lg font-bold text-blue-700">
                    {formState.fixedCostPercentage.toFixed(2)}%
                  </div>
                </div>
                <p className="text-sm text-blue-600">
                  {currentCosts 
                    ? 'Basado en los costos del mes actual' 
                    : 'Usando valor por defecto (15%)'}
                </p>
              </div>

              {/* Profit Configuration */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-green-700">Beneficio:</div>
                  <Input
                    type="number"
                    value={formState.profitPercentage}
                    onChange={(e) => setFormState(prev => {
                      const profitPercentage = Number(e.target.value);
                      const costs = calculateRecipeCosts(
                        prev.materials,
                        products,
                        recipes,
                        prev.yield,
                        prev.fixedCostPercentage,
                        profitPercentage,
                        prev.unitCost
                      );

                      return {
                        ...prev,
                        profitPercentage,
                        totalCost: costs.totalCost,
                        unitCost: costs.unitCost,
                        suggestedPrice: costs.suggestedPrice,
                        costHistory: costs.costHistory 
                          ? [...(prev.costHistory || []), ...costs.costHistory]
                          : prev.costHistory
                      };
                    })}
                    min={0}
                    max={99.99}
                    required
                    className="w-24 text-right bg-white"
                  />
                </div>
                <p className="text-sm text-green-600">
                  Porcentaje de beneficio esperado
                </p>
              </div>
            </div>

            {/* Cost Summary Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid gap-4">
                {/* Materials Cost */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Costo de Materiales:</div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatPrice(formState.totalCost)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total de {formState.materials.length} materiales
                  </div>
                </div>

                {/* Unit Cost */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Costo por {formState.yieldUnit || 'unidad'}:
                    </div>
                    <div className="text-lg font-medium text-blue-600">
                      {formatPrice(formState.unitCost)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Para un rendimiento de {formState.yield} {formState.yieldUnit}
                  </div>
                </div>

                {/* Suggested Price */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Precio Sugerido por {formState.yieldUnit || 'unidad'}:
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(formState.suggestedPrice)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Con {formState.profitPercentage}% de beneficio esperado
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Threshold Warning */}
            {formState.costHistory?.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <div className="text-sm font-medium">Umbral de Alerta:</div>
                  <div className="text-lg font-bold">
                    {formState.costThreshold}%
                  </div>
                </div>
                <p className="text-sm text-amber-600 mt-1">
                  Se notificará cuando el cambio en los costos supere este porcentaje
                </p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Notas Adicionales</Card.Title>
        </Card.Header>
        <Card.Content>
          <textarea
            value={formState.notes}
            onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </Card.Content>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Actualizar' : 'Crear'} Receta
        </Button>
      </div>
    </form>
  );
}
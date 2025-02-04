import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { MeasureSelect } from '@/components/ui/MeasureSelect';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { MaterialSelector } from './MaterialSelector';
import { MaterialList } from './MaterialList';
import { FullscreenProductEditor } from '@/components/products/FullscreenProductEditor';
import { calculateRecipeCosts } from '@/lib/recipes/calculations';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: RecipeFormProps) {
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    name: initialData?.name || '',
    yield: initialData?.yield || 0,
    yieldUnit: initialData?.yieldUnit || 'UNIDAD',
    materials: initialData?.materials || [],
    fixedCostPercentage: initialData?.fixedCostPercentage || 15,
    profitPercentage: initialData?.profitPercentage || 90,
    notes: initialData?.notes || '',
    totalCost: initialData?.totalCost || 0,
    unitCost: initialData?.unitCost || 0,
    suggestedPrice: initialData?.suggestedPrice || 0,
    lastUpdated: Date.now()
  });

  const { products, loading, updateProduct } = useGlobalProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (products.length > 0) {
      const costs = calculateRecipeCosts(
        formData.materials,
        products,
        formData.yield,
        formData.fixedCostPercentage,
        formData.profitPercentage
      );

      setFormData(prev => ({
        ...prev,
        totalCost: costs.totalCost,
        unitCost: costs.unitCost,
        suggestedPrice: costs.suggestedPrice
      }));
    }
  }, [
    formData.materials,
    formData.yield,
    formData.fixedCostPercentage,
    formData.profitPercentage,
    products
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.materials.length === 0) {
      toast.error('Debe agregar al menos un material');
      return;
    }

    if (formData.profitPercentage >= 100) {
      toast.error('El beneficio esperado debe ser menor al 100%');
      return;
    }

    await onSubmit(formData);
  };

  const handleAddMaterial = (product: Product, quantity: number) => {
    const existingMaterial = formData.materials.find(m => m.productId === product.id);
    if (existingMaterial) {
      toast.error('Este material ya está agregado a la receta');
      return;
    }

    const unitCost = product.pricePerUnit || 0;
    const totalCost = unitCost * quantity;

    const material: RecipeMaterial = {
      productId: product.id!,
      quantity,
      unit: product.unitMeasure || product.purchasePackaging,
      unitCost,
      totalCost
    };

    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, material]
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateMaterial = (index: number, quantity: number) => {
    setFormData(prev => {
      const materials = [...prev.materials];
      const material = materials[index];
      const product = products.find(p => p.id === material.productId);
      
      if (!product) return prev;

      const unitCost = product.pricePerUnit || 0;
      materials[index] = {
        ...material,
        quantity,
        unitCost,
        totalCost: unitCost * quantity
      };

      return { ...prev, materials };
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (product: Product, updates: Partial<Product>) => {
    await updateProduct(product.id!, updates);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Información Básica</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Input
              label="Nombre de la receta"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Rendimiento"
                value={formData.yield}
                onChange={(e) => setFormData(prev => ({ ...prev, yield: Number(e.target.value) }))}
                min={0}
                step="0.01"
                required
              />
              <MeasureSelect
                label="Unidad de Rendimiento"
                value={formData.yieldUnit}
                onChange={(value) => setFormData(prev => ({ ...prev, yieldUnit: value }))}
                required
                placeholder="Seleccionar unidad de rendimiento"
              />
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
              onSelect={handleAddMaterial}
              selectedMaterials={formData.materials.map(m => m.productId)}
            />
            <MaterialList
              materials={formData.materials}
              products={products}
              onRemove={handleRemoveMaterial}
              onUpdate={handleUpdateMaterial}
              onEditProduct={handleEditProduct}
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Configuración de Costos</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Gastos Fijos (%)"
                value={formData.fixedCostPercentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  fixedCostPercentage: Number(e.target.value)
                }))}
                min={0}
                max={100}
                required
              />
              <Input
                type="number"
                label="Beneficio Esperado (%)"
                value={formData.profitPercentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  profitPercentage: Number(e.target.value)
                }))}
                min={0}
                max={99.99}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-500">Costo Total:</span>
                <p className="text-lg font-medium">{formatPrice(formData.totalCost)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Costo Unitario:</span>
                <p className="text-lg font-medium">
                  {formatPrice(formData.unitCost)} / {formData.yieldUnit}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Precio Sugerido:</span>
                <p className="text-lg font-medium text-blue-600">
                  {formatPrice(formData.suggestedPrice)} / {formData.yieldUnit}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Notas Adicionales</Card.Title>
          </Card.Header>
          <Card.Content>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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

      {editingProduct && (
        <FullscreenProductEditor
          providerId={editingProduct.providerId}
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}
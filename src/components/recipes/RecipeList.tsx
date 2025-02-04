import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Pencil, Trash2, Printer, History } from 'lucide-react';
import { generateRecipePrintTemplate } from '@/lib/utils/printing/recipeTemplate';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecipeListProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onEdit, onDelete }: RecipeListProps) {
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [showHistory, setShowHistory] = useState<Recipe | null>(null);
  const { products } = useGlobalProducts();

  const handleDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    await onDelete(recipeToDelete);
    setRecipeToDelete(null);
  };

  const handlePrint = (recipe: Recipe) => {
    const template = generateRecipePrintTemplate(recipe, products);
    const printTab = window.open('', '_blank');
    if (!printTab) {
      throw new Error('No se pudo crear la pestaña de impresión');
    }

    printTab.document.write(template);
    printTab.document.close();
  };

  const getCardColor = (recipe: Recipe) => {
    if (!recipe.costHistory?.length) return '';
    
    const lastEntry = recipe.costHistory[recipe.costHistory.length - 1];
    const threshold = recipe.costThreshold || 20;

    if (Math.abs(lastEntry.changePercentage) > threshold) {
      return lastEntry.changePercentage > 0 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200';
    }
    return '';
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-gray-500">No hay recetas para mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`bg-white rounded-lg shadow-sm border p-4 space-y-4 transition-colors ${getCardColor(recipe)}`}
          >
            <div>
              <h3 className="text-lg font-semibold">{recipe.name}</h3>
              <p className="text-sm text-gray-500">
                Rendimiento: {recipe.yield} {recipe.yieldUnit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Costo Total:</span>
                <p className="font-medium">{formatPrice(recipe.totalCost)}</p>
              </div>
              <div>
                <span className="text-gray-500">Costo Unitario:</span>
                <p className="font-medium">
                  {formatPrice(recipe.unitCost)} / {recipe.yieldUnit}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Precio Sugerido:</span>
                <p className="font-medium text-blue-600">
                  {formatPrice(recipe.suggestedPrice)} / {recipe.yieldUnit}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-1 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(recipe)}
                title="Ver historial de costos"
                className="w-9 h-9 p-0"
              >
                <History className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePrint(recipe)}
                title="Imprimir receta"
                className="w-9 h-9 p-0"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(recipe)}
                title="Editar receta"
                className="w-9 h-9 p-0"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(recipe)}
                title="Eliminar receta"
                className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        title="Eliminar receta"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar la receta "{recipeToDelete?.name}"?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setRecipeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Cost History Dialog */}
      <Dialog
        isOpen={!!showHistory}
        onClose={() => setShowHistory(null)}
        title={`Historial de Costos - ${showHistory?.name}`}
      >
        <div className="space-y-4">
          {showHistory?.costHistory?.length ? (
            <div className="space-y-3">
              {showHistory.costHistory.map((entry, index) => {
                // Get previous cost
                const previousCost = index === 0 
                  ? showHistory.unitCost 
                  : showHistory.costHistory[index - 1].unitCost;

                return (
                  <div 
                    key={entry.date}
                    className={`p-3 rounded-lg ${
                      Math.abs(entry.changePercentage) > (showHistory.costThreshold || 20)
                        ? entry.changePercentage > 0
                          ? 'bg-red-50'
                          : 'bg-green-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {format(entry.date, "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                      </span>
                      <span className={`text-sm font-medium ${
                        entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {entry.changePercentage > 0 ? '+' : ''}
                        {entry.changePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-500">
                        {formatPrice(previousCost)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">
                        {formatPrice(entry.unitCost)}
                      </span>
                      <span className="text-gray-500">
                        / {showHistory.yieldUnit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay historial de costos disponible
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setShowHistory(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
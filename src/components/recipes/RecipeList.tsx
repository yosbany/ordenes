import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Recipe } from '@/types/recipe';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Pencil, Trash2, Printer, History, ChefHat } from 'lucide-react';
import { generateRecipePrintTemplate } from '@/lib/utils/printing/recipeTemplate';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';

interface RecipeListProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onEdit, onDelete }: RecipeListProps) {
  const [showHistory, setShowHistory] = useState<Recipe | null>(null);
  const { products } = useGlobalProducts();

  const handlePrint = (recipe: Recipe) => {
    const template = generateRecipePrintTemplate(recipe, products);
    const printTab = window.open('', '_blank');
    if (!printTab) {
      throw new Error('No se pudo crear la pestaña de impresión');
    }

    printTab.document.write(template);
    printTab.document.close();
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
        {recipes.map((recipe) => {
          const lastEntry = recipe.costHistory?.[recipe.costHistory.length - 1];
          const threshold = recipe.costThreshold || 20;
          const exceedsThreshold = lastEntry && Math.abs(lastEntry.changePercentage) > threshold;
          const isIncrease = lastEntry?.changePercentage > 0;

          return (
            <div
              key={recipe.id}
              className={`
                bg-white rounded-lg shadow-sm p-4 space-y-4 transition-colors
                ${exceedsThreshold ? `border-2 ${isIncrease ? 'border-red-500' : 'border-green-500'}` : 'border'}
                ${exceedsThreshold && isIncrease ? 'bg-red-50' : exceedsThreshold ? 'bg-green-50' : ''}
              `}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold flex-1 break-words">
                    {recipe.name}
                  </h3>
                  {recipe.isBase && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      <ChefHat className="w-3 h-3 mr-1" />
                      Base
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
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

              {exceedsThreshold && (
                <div className={`p-2 rounded-lg ${
                  isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  <div className="font-medium">
                    {isIncrease ? 'Aumento' : 'Reducción'} significativo
                  </div>
                  <div className="text-sm">
                    {lastEntry.changePercentage > 0 ? '+' : ''}
                    {lastEntry.changePercentage.toFixed(2)}% en el último mes
                  </div>
                </div>
              )}

              {/* Last Update Info */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                Última actualización: {format(recipe.lastUpdated, "d 'de' MMMM, yyyy HH:mm", { locale: es })}
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
                  onClick={() => onDelete(recipe)}
                  title="Eliminar receta"
                  className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

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
                const isSignificantChange = Math.abs(entry.changePercentage) > (showHistory.costThreshold || 20);
                const isIncrease = entry.changePercentage > 0;

                return (
                  <div 
                    key={`${entry.date}-${index}`}
                    className={`p-3 rounded-lg ${
                      isSignificantChange
                        ? isIncrease
                          ? 'bg-red-50 border-2 border-red-500'
                          : 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 border border-gray-200'
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
                    <div className="mt-1">
                      <span className="font-medium">
                        {formatPrice(entry.unitCost)}
                      </span>
                      <span className="text-gray-500">
                        {' '}/ {showHistory.yieldUnit}
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
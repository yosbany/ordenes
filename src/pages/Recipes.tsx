import React, { useState } from 'react';
import { Plus, Search, RefreshCw, Calculator } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { FixedCostsForm } from '@/components/recipes/FixedCostsForm';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { useFixedCosts } from '@/hooks/useFixedCosts';
import { calculateRecipeCosts, updateDependentRecipes } from '@/lib/recipes/calculations';
import { toast } from 'react-hot-toast';

export function Recipes() {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { products, loading: productsLoading } = useGlobalProducts();
  const { currentCosts, loading: costsLoading, updateFixedCosts } = useFixedCosts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFixedCostsFormOpen, setIsFixedCostsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingCosts, setIsUpdatingCosts] = useState(false);

  // Sort recipes: base recipes first, then by name
  const sortedRecipes = [...recipes].sort((a, b) => {
    if (a.isBase && !b.isBase) return -1;
    if (!a.isBase && b.isBase) return 1;
    return a.name.localeCompare(b.name);
  });

  const filteredRecipes = sortedRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Recipe, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id!, {
          ...data,
          costThreshold: data.costThreshold || 20,
          lastUpdated: Date.now()
        });
        toast.success('Receta actualizada exitosamente');
      } else {
        await addRecipe({
          ...data,
          costHistory: [],
          costThreshold: 20,
          lastUpdated: Date.now()
        });
        toast.success('Receta creada exitosamente');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Error al guardar la receta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recipe: Recipe) => {
    try {
      await deleteRecipe(recipe.id!);
      toast.success('Receta eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la receta');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleUpdateAllCosts = async () => {
    if (!products.length) {
      toast.error('No hay productos disponibles para actualizar los costos');
      return;
    }

    if (!currentCosts) {
      toast.error('Debe configurar los costos fijos del mes actual primero');
      setIsFixedCostsFormOpen(true);
      return;
    }

    setIsUpdatingCosts(true);
    let updatedCount = 0;
    let errorCount = 0;

    try {
      // First update base recipes
      let updatedRecipes = [...recipes];
      const baseRecipes = updatedRecipes.filter(r => r.isBase);

      for (const recipe of baseRecipes) {
        try {
          const costs = calculateRecipeCosts(
            recipe.materials,
            products,
            updatedRecipes,
            recipe.yield,
            currentCosts.fixedCostPercentage,
            recipe.profitPercentage,
            recipe.unitCost
          );

          if (costs.totalCost !== recipe.totalCost || 
              costs.unitCost !== recipe.unitCost || 
              costs.suggestedPrice !== recipe.suggestedPrice) {
            const costHistory = recipe.costHistory || [];
            if (costs.costHistory?.[0]) {
              costHistory.push(costs.costHistory[0]);
            }

            const updatedRecipe = {
              ...recipe,
              totalCost: costs.totalCost,
              unitCost: costs.unitCost,
              suggestedPrice: costs.suggestedPrice,
              fixedCostPercentage: currentCosts.fixedCostPercentage,
              costHistory,
              lastUpdated: Date.now()
            };

            await updateRecipe(recipe.id!, updatedRecipe);
            updatedCount++;

            // Update recipe in local array
            const index = updatedRecipes.findIndex(r => r.id === recipe.id);
            if (index !== -1) {
              updatedRecipes[index] = updatedRecipe;
            }

            // Update dependent recipes
            updatedRecipes = updateDependentRecipes(
              updatedRecipes,
              products,
              recipe.id!
            );
          }
        } catch (error) {
          console.error(`Error updating recipe ${recipe.id}:`, error);
          errorCount++;
        }
      }

      // Then update non-base recipes
      const nonBaseRecipes = updatedRecipes.filter(r => !r.isBase);
      for (const recipe of nonBaseRecipes) {
        try {
          const costs = calculateRecipeCosts(
            recipe.materials,
            products,
            updatedRecipes,
            recipe.yield,
            currentCosts.fixedCostPercentage,
            recipe.profitPercentage,
            recipe.unitCost
          );

          if (costs.totalCost !== recipe.totalCost || 
              costs.unitCost !== recipe.unitCost || 
              costs.suggestedPrice !== recipe.suggestedPrice) {
            const costHistory = recipe.costHistory || [];
            if (costs.costHistory?.[0]) {
              costHistory.push(costs.costHistory[0]);
            }

            await updateRecipe(recipe.id!, {
              ...recipe,
              totalCost: costs.totalCost,
              unitCost: costs.unitCost,
              suggestedPrice: costs.suggestedPrice,
              fixedCostPercentage: currentCosts.fixedCostPercentage,
              costHistory,
              lastUpdated: Date.now()
            });
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating recipe ${recipe.id}:`, error);
          errorCount++;
        }
      }

      if (updatedCount > 0) {
        toast.success(`${updatedCount} recetas actualizadas exitosamente`);
      } else if (errorCount === 0) {
        toast.success('Los costos están actualizados');
      }

      if (errorCount > 0) {
        toast.error(`Error al actualizar ${errorCount} recetas`);
      }
    } catch (error) {
      toast.error('Error al actualizar los costos');
    } finally {
      setIsUpdatingCosts(false);
    }
  };

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <RecipeForm
            initialData={editingRecipe}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={isSubmitting}
            recipes={recipes}
          />
        </div>
      ) : (
        <>
          {/* Header and Actions */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Input
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button 
                onClick={() => setIsFixedCostsFormOpen(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Costos Fijos</span>
                <span className="sm:hidden">Costos</span>
              </Button>
              
              <Button 
                onClick={handleUpdateAllCosts} 
                variant="outline"
                isLoading={isUpdatingCosts}
                disabled={isUpdatingCosts || loading || productsLoading || costsLoading}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Actualizar Costos</span>
                <span className="sm:hidden">Actualizar</span>
              </Button>
              
              <Button 
                onClick={() => setIsFormOpen(true)} 
                className="w-full sm:col-auto col-span-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Nueva Receta</span>
              </Button>
            </div>
          </div>

          {/* Recipe List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <RecipeList
              recipes={filteredRecipes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {/* Fixed Costs Form Dialog */}
      <Dialog
        isOpen={isFixedCostsFormOpen}
        onClose={() => setIsFixedCostsFormOpen(false)}
        title="Configuración de Costos Fijos"
      >
        <FixedCostsForm
          initialData={currentCosts || undefined}
          onSubmit={async (data) => {
            try {
              await updateFixedCosts(data);
              setIsFixedCostsFormOpen(false);
              // Automatically update all recipes with new fixed costs
              handleUpdateAllCosts();
            } catch (error) {
              // Error is handled by the hook
            }
          }}
          onCancel={() => setIsFixedCostsFormOpen(false)}
        />
      </Dialog>
    </div>
  );
}
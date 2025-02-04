import React, { useState } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { useRecipes } from '@/hooks/useRecipes';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { calculateRecipeCosts } from '@/lib/recipes/calculations';
import { toast } from 'react-hot-toast';

export function Recipes() {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { products, loading: productsLoading } = useGlobalProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingCosts, setIsUpdatingCosts] = useState(false);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Recipe, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id!, {
          ...data,
          costThreshold: data.costThreshold || 20
        });
        toast.success('Receta actualizada exitosamente');
      } else {
        await addRecipe({
          ...data,
          costHistory: [],
          costThreshold: 20
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

    setIsUpdatingCosts(true);
    let updatedCount = 0;
    let errorCount = 0;

    try {
      // Update each recipe
      for (const recipe of recipes) {
        try {
          // Calculate new costs
          const costs = calculateRecipeCosts(
            recipe.materials,
            products,
            recipe.yield,
            recipe.fixedCostPercentage,
            recipe.profitPercentage,
            recipe.unitCost
          );

          // Update recipe if costs have changed
          if (
            costs.totalCost !== recipe.totalCost ||
            costs.unitCost !== recipe.unitCost ||
            costs.suggestedPrice !== recipe.suggestedPrice
          ) {
            // Add new cost history entry if costs changed
            const costHistory = recipe.costHistory || [];
            if (costs.costHistory?.[0]) {
              costHistory.push(costs.costHistory[0]);
            }

            await updateRecipe(recipe.id!, {
              ...recipe,
              totalCost: costs.totalCost,
              unitCost: costs.unitCost,
              suggestedPrice: costs.suggestedPrice,
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

      // Show success/error message
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
      {isFormOpen || editingRecipe ? (
        <RecipeForm
          initialData={editingRecipe}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleUpdateAllCosts} 
                variant="outline"
                isLoading={isUpdatingCosts}
                disabled={isUpdatingCosts || loading || productsLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar Costos
              </Button>
              <Button 
                onClick={() => setIsFormOpen(true)} 
                className="flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Receta
              </Button>
            </div>
          </div>

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
    </div>
  );
}
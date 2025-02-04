import { makeAutoObservable } from 'mobx';
import { Recipe } from '@/core/domain/entities';
import { IRecipeRepository } from '@/core/domain/repositories/IRecipeRepository';
import { CreateRecipeUseCase } from '@/core/application/useCases/recipes/CreateRecipeUseCase';
import { toast } from 'react-hot-toast';

export class RecipeViewModel {
  recipes: Recipe[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private recipeRepository: IRecipeRepository,
    private createRecipeUseCase: CreateRecipeUseCase
  ) {
    makeAutoObservable(this);
  }

  async loadRecipes() {
    try {
      this.loading = true;
      this.error = null;
      const recipes = await this.recipeRepository.getAll();
      this.recipes = recipes;
    } catch (error) {
      this.error = 'Error al cargar las recetas';
      toast.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  async createRecipe(recipe: Omit<Recipe, 'id'>) {
    try {
      this.error = null;
      const recipeId = await this.createRecipeUseCase.execute(recipe);
      toast.success('Receta creada exitosamente');
      return recipeId;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Error al crear la receta';
      toast.error(this.error);
      throw error;
    }
  }

  async updateRecipe(id: string, updates: Partial<Recipe>) {
    try {
      this.error = null;
      await this.recipeRepository.update(id, updates);
      toast.success('Receta actualizada exitosamente');
    } catch (error) {
      this.error = 'Error al actualizar la receta';
      toast.error(this.error);
      throw error;
    }
  }

  async deleteRecipe(id: string) {
    try {
      this.error = null;
      await this.recipeRepository.delete(id);
      toast.success('Receta eliminada exitosamente');
    } catch (error) {
      this.error = 'Error al eliminar la receta';
      toast.error(this.error);
      throw error;
    }
  }
}
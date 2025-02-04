import { Recipe } from '../entities';

export interface IRecipeRepository {
  getAll(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  create(recipe: Omit<Recipe, 'id'>): Promise<string>;
  update(id: string, recipe: Partial<Recipe>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToRecipes(callback: (recipes: Recipe[]) => void): () => void;
}
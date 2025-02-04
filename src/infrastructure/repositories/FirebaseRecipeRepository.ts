import { ref, push, update, remove, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Recipe } from '@/core/domain/entities';
import { IRecipeRepository } from '@/core/domain/repositories/IRecipeRepository';
import { DatabaseError } from '@/core/domain/errors';

export class FirebaseRecipeRepository implements IRecipeRepository {
  private readonly COLLECTION = 'recipes';

  async getAll(): Promise<Recipe[]> {
    try {
      const recipesRef = ref(db, this.COLLECTION);
      const snapshot = await get(recipesRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Recipe, 'id'>)
      }));
    } catch (error) {
      throw new DatabaseError('Failed to fetch recipes', { cause: error });
    }
  }

  async getById(id: string): Promise<Recipe | null> {
    try {
      const recipeRef = ref(db, `${this.COLLECTION}/${id}`);
      const snapshot = await get(recipeRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id,
        ...snapshot.val()
      } as Recipe;
    } catch (error) {
      throw new DatabaseError('Failed to fetch recipe', { cause: error });
    }
  }

  async create(recipe: Omit<Recipe, 'id'>): Promise<string> {
    try {
      const recipesRef = ref(db, this.COLLECTION);
      const newRecipeRef = push(recipesRef);
      
      if (!newRecipeRef.key) {
        throw new DatabaseError('Failed to generate recipe ID');
      }

      await update(newRecipeRef, {
        ...recipe,
        lastUpdated: Date.now()
      });
      return newRecipeRef.key;
    } catch (error) {
      throw new DatabaseError('Failed to create recipe', { cause: error });
    }
  }

  async update(id: string, updates: Partial<Recipe>): Promise<void> {
    try {
      const recipeRef = ref(db, `${this.COLLECTION}/${id}`);
      await update(recipeRef, {
        ...updates,
        lastUpdated: Date.now()
      });
    } catch (error) {
      throw new DatabaseError('Failed to update recipe', { cause: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const recipeRef = ref(db, `${this.COLLECTION}/${id}`);
      await remove(recipeRef);
    } catch (error) {
      throw new DatabaseError('Failed to delete recipe', { cause: error });
    }
  }

  subscribeToRecipes(callback: (recipes: Recipe[]) => void): () => void {
    const recipesRef = ref(db, this.COLLECTION);

    const unsubscribe = onValue(recipesRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const recipes = Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...(data as Omit<Recipe, 'id'>)
        }))
        .sort((a, b) => b.lastUpdated - a.lastUpdated);

      callback(recipes);
    });

    return unsubscribe;
  }
}
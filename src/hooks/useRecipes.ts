import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Recipe } from '@/types/recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recipesRef = ref(db, 'recipes');
    const unsubscribe = onValue(recipesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      const recipesData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Recipe, 'id'>)
      }));

      setRecipes(recipesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const recipesRef = ref(db, 'recipes');
    await push(recipesRef, {
      ...recipe,
      lastUpdated: Date.now()
    });
  };

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    const recipeRef = ref(db, `recipes/${id}`);
    await update(recipeRef, {
      ...recipe,
      lastUpdated: Date.now()
    });
  };

  const deleteRecipe = async (id: string) => {
    const recipeRef = ref(db, `recipes/${id}`);
    await remove(recipeRef);
  };

  return {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe
  };
}
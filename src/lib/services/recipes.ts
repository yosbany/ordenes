import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { Recipe } from '@/types/recipe';
import { DatabaseError } from './errors';

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    // Create a clean updates object with only defined values
    const cleanUpdates: Record<string, any> = {};

    // Handle sale price updates
    if (typeof updates.salePrice === 'number') {
      cleanUpdates.salePrice = Number(updates.salePrice);
    }

    // Handle forSale flag
    if (typeof updates.forSale === 'boolean') {
      cleanUpdates.forSale = updates.forSale;
    }

    // Handle lastUpdated
    cleanUpdates.lastUpdated = Date.now();

    // Only update if we have valid changes
    if (Object.keys(cleanUpdates).length > 0) {
      const recipeRef = ref(db, `recipes/${id}`);
      await update(recipeRef, cleanUpdates);
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    if (error instanceof DatabaseError) {
      throw error;
    }
    
    throw new DatabaseError('Failed to update recipe', { 
      cause: error instanceof Error ? error : new Error('Unknown error') 
    });
  }
}
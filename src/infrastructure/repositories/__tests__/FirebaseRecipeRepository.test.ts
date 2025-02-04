import { FirebaseRecipeRepository } from '../FirebaseRecipeRepository';
import { Recipe } from '@/core/domain/entities';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

describe('FirebaseRecipeRepository', () => {
  let repository: FirebaseRecipeRepository;
  const COLLECTION = 'recipes';

  const mockRecipe: Omit<Recipe, 'id'> = {
    name: 'Test Recipe',
    yield: 10,
    yieldUnit: 'UNIDAD',
    materials: [
      {
        productId: 'product-1',
        quantity: 2,
        unit: 'CAJA',
        unitCost: 10.50,
        totalCost: 21.00
      }
    ],
    fixedCostPercentage: 20,
    profitPercentage: 30,
    notes: 'Test notes',
    totalCost: 25.20,
    unitCost: 2.52,
    suggestedPrice: 3.28,
    lastUpdated: Date.now()
  };

  beforeEach(async () => {
    repository = new FirebaseRecipeRepository();
    // Clear test data
    await remove(ref(db, COLLECTION));
  });

  afterEach(async () => {
    // Cleanup
    await remove(ref(db, COLLECTION));
  });

  describe('getAll', () => {
    it('should return empty array when no recipes exist', async () => {
      const recipes = await repository.getAll();
      expect(recipes).toEqual([]);
    });

    it('should return all recipes', async () => {
      const recipesRef = ref(db, COLLECTION);
      await set(recipesRef, {
        'recipe-1': { ...mockRecipe },
        'recipe-2': { ...mockRecipe }
      });

      const recipes = await repository.getAll();
      expect(recipes).toHaveLength(2);
      expect(recipes[0]).toHaveProperty('id');
      expect(recipes[0].name).toBe(mockRecipe.name);
    });

    it('should sort recipes by lastUpdated in descending order', async () => {
      const now = Date.now();
      const recipesRef = ref(db, COLLECTION);
      await set(recipesRef, {
        'recipe-1': { ...mockRecipe, lastUpdated: now - 1000 },
        'recipe-2': { ...mockRecipe, lastUpdated: now }
      });

      const recipes = await repository.getAll();
      expect(recipes[0].lastUpdated).toBeGreaterThan(recipes[1].lastUpdated);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent recipe', async () => {
      const recipe = await repository.getById('non-existent');
      expect(recipe).toBeNull();
    });

    it('should return recipe by id', async () => {
      const recipeId = 'test-recipe';
      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      await set(recipeRef, mockRecipe);

      const recipe = await repository.getById(recipeId);
      expect(recipe).not.toBeNull();
      expect(recipe?.id).toBe(recipeId);
      expect(recipe?.name).toBe(mockRecipe.name);
    });
  });

  describe('create', () => {
    it('should create new recipe', async () => {
      const recipeId = await repository.create(mockRecipe);
      expect(recipeId).toBeTruthy();

      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      const snapshot = await get(recipeRef);
      expect(snapshot.exists()).toBe(true);
      
      const savedRecipe = snapshot.val();
      expect(savedRecipe.name).toBe(mockRecipe.name);
      expect(savedRecipe.lastUpdated).toBeDefined();
      expect(typeof savedRecipe.lastUpdated).toBe('number');
    });

    it('should update lastUpdated timestamp on create', async () => {
      const before = Date.now();
      const recipeId = await repository.create(mockRecipe);
      const after = Date.now();

      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      const snapshot = await get(recipeRef);
      const savedRecipe = snapshot.val();

      expect(savedRecipe.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(savedRecipe.lastUpdated).toBeLessThanOrEqual(after);
    });
  });

  describe('update', () => {
    it('should update existing recipe', async () => {
      const recipeId = 'test-recipe';
      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      await set(recipeRef, mockRecipe);

      const updates = { 
        name: 'Updated Recipe',
        yield: 20
      };
      await repository.update(recipeId, updates);

      const snapshot = await get(recipeRef);
      const updatedRecipe = snapshot.val();
      expect(updatedRecipe.name).toBe(updates.name);
      expect(updatedRecipe.yield).toBe(updates.yield);
      // Other fields should remain unchanged
      expect(updatedRecipe.yieldUnit).toBe(mockRecipe.yieldUnit);
    });

    it('should update lastUpdated timestamp on update', async () => {
      const recipeId = 'test-recipe';
      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      await set(recipeRef, {
        ...mockRecipe,
        lastUpdated: Date.now() - 1000 // Old timestamp
      });

      const before = Date.now();
      await repository.update(recipeId, { name: 'Updated Recipe' });
      const after = Date.now();

      const snapshot = await get(recipeRef);
      const updatedRecipe = snapshot.val();

      expect(updatedRecipe.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(updatedRecipe.lastUpdated).toBeLessThanOrEqual(after);
    });

    it('should throw error for non-existent recipe', async () => {
      await expect(
        repository.update('non-existent', { name: 'New Name' })
      ).rejects.toThrow();
    });

    it('should update materials array', async () => {
      const recipeId = 'test-recipe';
      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      await set(recipeRef, mockRecipe);

      const newMaterials = [
        {
          productId: 'product-2',
          quantity: 3,
          unit: 'BOLSA',
          unitCost: 5.00,
          totalCost: 15.00
        }
      ];

      await repository.update(recipeId, { materials: newMaterials });

      const snapshot = await get(recipeRef);
      expect(snapshot.val().materials).toEqual(newMaterials);
    });
  });

  describe('delete', () => {
    it('should delete existing recipe', async () => {
      const recipeId = 'test-recipe';
      const recipeRef = ref(db, `${COLLECTION}/${recipeId}`);
      await set(recipeRef, mockRecipe);

      await repository.delete(recipeId);

      const snapshot = await get(recipeRef);
      expect(snapshot.exists()).toBe(false);
    });

    it('should not throw error when deleting non-existent recipe', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('subscribeToRecipes', () => {
    it('should call callback with initial data', (done) => {
      const callback = (recipes: Recipe[]) => {
        expect(recipes).toEqual([]);
        unsubscribe();
        done();
      };

      const unsubscribe = repository.subscribeToRecipes(callback);
    });

    it('should call callback when data changes', (done) => {
      let callCount = 0;
      
      const callback = (recipes: Recipe[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(recipes).toEqual([]);
          
          // Add test data
          const recipesRef = ref(db, COLLECTION);
          set(recipesRef, {
            'recipe-1': mockRecipe
          });
        }
        
        if (callCount === 2) {
          // Data after change
          expect(recipes).toHaveLength(1);
          expect(recipes[0].name).toBe(mockRecipe.name);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToRecipes(callback);
    });

    it('should sort recipes by lastUpdated in real-time', (done) => {
      let callCount = 0;
      const now = Date.now();
      
      const callback = async (recipes: Recipe[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(recipes).toEqual([]);
          
          // Add recipes with different timestamps
          const recipesRef = ref(db, COLLECTION);
          await set(recipesRef, {
            'recipe-1': { ...mockRecipe, lastUpdated: now - 1000 },
            'recipe-2': { ...mockRecipe, lastUpdated: now }
          });
        }
        
        if (callCount === 2) {
          // Verify sort order
          expect(recipes).toHaveLength(2);
          expect(recipes[0].lastUpdated).toBeGreaterThan(recipes[1].lastUpdated);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToRecipes(callback);
    });

    it('should handle multiple data changes', (done) => {
      let callCount = 0;
      
      const callback = async (recipes: Recipe[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(recipes).toEqual([]);
          
          // Add first recipe
          const recipesRef = ref(db, COLLECTION);
          await set(recipesRef, {
            'recipe-1': mockRecipe
          });
        }
        
        if (callCount === 2) {
          // Data after first change
          expect(recipes).toHaveLength(1);
          
          // Add second recipe
          const recipesRef = ref(db, COLLECTION);
          await set(recipesRef, {
            'recipe-1': mockRecipe,
            'recipe-2': { ...mockRecipe, name: 'Second Recipe' }
          });
        }
        
        if (callCount === 3) {
          // Data after second change
          expect(recipes).toHaveLength(2);
          expect(recipes.some(r => r.name === 'Second Recipe')).toBe(true);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToRecipes(callback);
    });
  });
});
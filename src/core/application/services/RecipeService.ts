import { Recipe } from '@/core/domain/entities';
import { IRecipeRepository } from '@/core/domain/repositories/IRecipeRepository';
import { IEventBus } from '@/core/domain/events/IEventBus';
import { ILogger } from '@/core/domain/logging/ILogger';
import { RecipeCreatedEvent, RecipeUpdatedEvent, RecipeDeletedEvent } from '@/core/domain/events';
import { RecipeValidator } from '@/core/domain/validators/RecipeValidator';

export class RecipeService {
  constructor(
    private recipeRepository: IRecipeRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async createRecipe(recipe: Omit<Recipe, 'id'>): Promise<string> {
    try {
      this.logger.info('Creating new recipe', { name: recipe.name });

      // Validar receta
      const validationError = RecipeValidator.validate(recipe);
      if (validationError) {
        throw validationError;
      }

      // Crear receta
      const recipeId = await this.recipeRepository.create(recipe);
      
      // Publicar evento
      this.eventBus.publish(new RecipeCreatedEvent({ id: recipeId, ...recipe }));
      
      this.logger.info('Recipe created successfully', { recipeId });
      return recipeId;
    } catch (error) {
      this.logger.error('Error creating recipe', error as Error);
      throw error;
    }
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    try {
      this.logger.info('Updating recipe', { recipeId: id });

      await this.recipeRepository.update(id, updates);
      
      // Publicar evento
      this.eventBus.publish(new RecipeUpdatedEvent(id, updates));
      
      this.logger.info('Recipe updated successfully', { recipeId: id });
    } catch (error) {
      this.logger.error('Error updating recipe', error as Error);
      throw error;
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      this.logger.info('Deleting recipe', { recipeId: id });

      await this.recipeRepository.delete(id);
      
      // Publicar evento
      this.eventBus.publish(new RecipeDeletedEvent(id));
      
      this.logger.info('Recipe deleted successfully', { recipeId: id });
    } catch (error) {
      this.logger.error('Error deleting recipe', error as Error);
      throw error;
    }
  }
}
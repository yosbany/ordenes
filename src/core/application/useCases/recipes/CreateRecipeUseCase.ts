import { Recipe } from '@/core/domain/entities';
import { IRecipeRepository } from '@/core/domain/repositories/IRecipeRepository';
import { RecipeValidator } from '@/core/domain/validators/RecipeValidator';

export class CreateRecipeUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute(recipe: Omit<Recipe, 'id'>): Promise<string> {
    // Validate recipe
    const validationError = RecipeValidator.validate(recipe);
    if (validationError) {
      throw validationError;
    }

    // Create recipe
    return await this.recipeRepository.create(recipe);
  }
}
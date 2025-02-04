import { Recipe } from '../entities';

export class RecipeCreatedEvent {
  constructor(public readonly recipe: Recipe) {}
}

export class RecipeUpdatedEvent {
  constructor(
    public readonly recipeId: string,
    public readonly updates: Partial<Recipe>
  ) {}
}

export class RecipeDeletedEvent {
  constructor(public readonly recipeId: string) {}
}
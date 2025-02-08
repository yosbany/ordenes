import React from 'react';
import { ChefHat, Book, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useRecipes } from '@/hooks/useRecipes';
import { useNavigate } from 'react-router-dom';

export function RecipesCard() {
  const { recipes, loading } = useRecipes();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <Card.Header className="!p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card.Header>
      </Card>
    );
  }

  const baseRecipes = recipes.filter(r => r.isBase);
  const regularRecipes = recipes.filter(r => !r.isBase);

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => navigate('/recipes')}
    >
      <Card.Header className="!p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ChefHat className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold">Recetas</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Recetas Base</span>
            </div>
            <span className="text-2xl font-bold text-amber-900">
              {baseRecipes.length}
            </span>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 mb-1">
              <Book className="w-4 h-4" />
              <span className="text-sm font-medium">Recetas</span>
            </div>
            <span className="text-2xl font-bold text-amber-900">
              {regularRecipes.length}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-gray-600">
            <span>Total Recetas</span>
            <span className="text-xl font-bold text-amber-600">
              {recipes.length}
            </span>
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}
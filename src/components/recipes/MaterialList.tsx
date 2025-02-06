import React from 'react';
import { Package, Scale, ChefHat, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { Recipe, RecipeMaterial } from '@/types/recipe';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface MaterialListProps {
  materials: RecipeMaterial[];
  products: Product[];
  recipes: Recipe[];
  onRemove: (index: number) => void;
}

export function MaterialList({
  materials,
  products,
  recipes,
  onRemove
}: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay materiales agregados</p>
        <p className="text-sm text-gray-400 mt-1">
          Utilice el buscador para agregar materiales a la receta
        </p>
      </div>
    );
  }

  const totalCost = materials.reduce((sum, material) => sum + material.totalCost, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Material
            </th>
            <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-32">
              Cantidad
            </th>
            <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-500 w-32">
              Costo
            </th>
            <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-16">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {materials.map((material, index) => {
            const product = products.find(p => p.id === material.id);
            const recipe = recipes.find(r => r.id === material.id);
            const item = product || recipe;
            if (!item) return null;

            const isRecipe = material.type === 'recipe';

            return (
              <tr 
                key={`${material.type}-${material.id}-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isRecipe ? (
                          <ChefHat className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        {isRecipe ? (
                          <span className="flex items-center gap-1">
                            <ChefHat className="w-4 h-4" />
                            Receta Base
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {product!.sku}
                            </span>
                            {product!.unitMeasure && (
                              <span className="flex items-center gap-1">
                                <Scale className="w-4 h-4" />
                                {product!.unitMeasure}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">
                    {material.quantity} {material.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-gray-900">
                    {formatPrice(material.totalCost)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(material.unitCost)} c/u
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-500">
              Total Materiales
            </td>
            <td colSpan={2} className="px-4 py-3 text-right">
              <span className="font-bold text-blue-600">
                {formatPrice(totalCost)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
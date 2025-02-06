import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/types';
import { Recipe } from '@/types/recipe';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface MaterialSelectorProps {
  products: Product[];
  recipes: Recipe[];
  onSelect: (material: { id: string; type: 'product' | 'recipe' }, quantity: number) => void;
  selectedMaterials: string[];
}

export function MaterialSelector({ 
  products, 
  recipes,
  onSelect, 
  selectedMaterials 
}: MaterialSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string; type: 'product' | 'recipe' } | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  // Get only production materials and base recipes that haven't been selected yet
  const availableProducts = products.filter(p => 
    p.isProduction && !selectedMaterials.includes(p.id!)
  );

  const availableRecipes = recipes.filter(r => 
    r.isBase && !selectedMaterials.includes(r.id!)
  );

  // Filter and sort available materials
  const filteredMaterials = [...availableProducts.map(p => ({
    id: p.id!,
    type: 'product' as const,
    name: p.name,
    sku: p.sku,
    unit: p.unitMeasure || p.purchasePackaging,
    unitCost: p.pricePerUnit || 0
  })), ...availableRecipes.map(r => ({
    id: r.id!,
    type: 'recipe' as const,
    name: r.name,
    unit: r.yieldUnit,
    unitCost: r.unitCost
  }))].filter(material => {
    const searchLower = searchTerm.toLowerCase();
    return material.name.toLowerCase().includes(searchLower) ||
           (material.type === 'product' && material.sku.toLowerCase().includes(searchLower));
  }).sort((a, b) => {
    // Prioritize exact matches
    const aNameMatch = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
    const bNameMatch = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return a.name.localeCompare(b.name);
  }).slice(0, 5);

  const handleSelect = (material: typeof filteredMaterials[0]) => {
    setSelectedMaterial({ id: material.id, type: material.type });
    setSearchTerm(material.name);
    setShowResults(false);
  };

  const handleAdd = () => {
    if (selectedMaterial && quantity > 0) {
      onSelect(selectedMaterial, quantity);
      setSelectedMaterial(null);
      setSearchTerm('');
      setQuantity(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Material Search */}
        <div className="relative">
          <div className="relative">
            <Input
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
                setSelectedMaterial(null);
              }}
              onFocus={() => setShowResults(true)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Search Results */}
          {showResults && searchTerm && filteredMaterials.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredMaterials.map((material) => (
                <button
                  key={`${material.type}-${material.id}`}
                  type="button"
                  onClick={() => handleSelect(material)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <div className="font-medium">{material.name}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-between">
                    <span>
                      {material.type === 'product' ? material.sku : 'Receta Base'}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {formatPrice(material.unitCost)} / {material.unit}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showResults && searchTerm && filteredMaterials.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              No se encontraron materiales disponibles
            </div>
          )}

          {/* Available Materials Count */}
          {!searchTerm && (
            <div className="mt-1 text-xs text-gray-500">
              {availableProducts.length} materiales de producción y {availableRecipes.length} recetas base disponibles
            </div>
          )}
        </div>

        {/* Quantity Input */}
        {selectedMaterial && (
          <div className="flex gap-2">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0}
              step="0.01"
              placeholder="Cantidad"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={quantity <= 0}
            >
              Agregar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
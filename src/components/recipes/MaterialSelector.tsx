import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface MaterialSelectorProps {
  products: Product[];
  onSelect: (product: Product, quantity: number) => void;
  selectedMaterials: string[];
}

export function MaterialSelector({ products, onSelect, selectedMaterials }: MaterialSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  // Get only production materials that haven't been selected yet
  const availableProducts = products.filter(p => 
    p.isProduction && !selectedMaterials.includes(p.id!)
  );

  // Filter and sort available products
  const filteredProducts = availableProducts
    .filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.supplierCode?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      // Prioritize exact matches
      const aNameMatch = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bNameMatch = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowResults(false);
  };

  const handleAdd = () => {
    if (selectedProduct && quantity > 0) {
      onSelect(selectedProduct, quantity);
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Product Search */}
        <div className="relative">
          <Input
            placeholder="Buscar material de producción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
              setSelectedProduct(null);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          {/* Search Results */}
          {showResults && searchTerm && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-between">
                    <span>{product.sku}</span>
                    <span className="text-blue-600 font-medium">
                      {formatPrice(product.pricePerUnit || 0)} / {product.unitMeasure}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showResults && searchTerm && filteredProducts.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              No se encontraron materiales de producción disponibles
            </div>
          )}

          {/* Available Materials Count */}
          {!searchTerm && (
            <div className="mt-1 text-xs text-gray-500">
              {availableProducts.length} materiales de producción disponibles
            </div>
          )}
        </div>

        {/* Quantity Input */}
        {selectedProduct && (
          <div className="flex gap-2">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0}
              step="0.01"
              placeholder={`Cantidad en ${selectedProduct.unitMeasure}`}
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
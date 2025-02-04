import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { formatPrice } from '@/lib/utils';

interface GlobalProductSearchProps {
  onProductSelect: (product: Product) => void;
}

export function GlobalProductSearch({ onProductSelect }: GlobalProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { products, loading } = useGlobalProducts();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const results = products
      .filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.sku.toLowerCase().includes(searchTermLower) ||
        product.supplierCode?.toLowerCase().includes(searchTermLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aNameMatch = a.name.toLowerCase().startsWith(searchTermLower);
        const bNameMatch = b.name.toLowerCase().startsWith(searchTermLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    setSearchResults(results);
  }, [searchTerm, products]);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          placeholder="Buscar productos globalmente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchResults.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku}
                    {product.supplierCode && (
                      <span className="ml-2">• Código: {product.supplierCode}</span>
                    )}
                  </div>
                </div>
                <div className="text-blue-600 font-medium whitespace-nowrap">
                  {formatPrice(product.price)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchTerm && searchResults.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}
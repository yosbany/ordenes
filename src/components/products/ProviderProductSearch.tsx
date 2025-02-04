import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';

interface ProviderProductSearchProps {
  products: Product[];
  onFilter: (filtered: Product[], isActiveFilter: boolean) => void;
}

export function ProviderProductSearch({ products, onFilter }: ProviderProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductionOnly, setShowProductionOnly] = useState(false);

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      // Apply production filter if enabled
      if (showProductionOnly && !product.isProduction) {
        return false;
      }

      // If no search term and not filtering by production, show all
      if (!searchTermLower && !showProductionOnly) {
        return true;
      }

      // Apply search filter
      return (
        product.name.toLowerCase().includes(searchTermLower) ||
        product.sku.toLowerCase().includes(searchTermLower) ||
        product.supplierCode?.toLowerCase().includes(searchTermLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    });

    // Sort filtered results
    const sortedFiltered = filtered.sort((a, b) => {
      // Production materials first if filter is active
      if (showProductionOnly) {
        if (a.isProduction && !b.isProduction) return -1;
        if (!a.isProduction && b.isProduction) return 1;
      }
      
      // Then by name
      return a.name.localeCompare(b.name);
    });

    onFilter(sortedFiltered, searchTerm.length > 0 || showProductionOnly);
  }, [searchTerm, showProductionOnly, products, onFilter]);

  const productionCount = products.filter(p => p.isProduction).length;

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Filtrar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      <Button
        variant={showProductionOnly ? "primary" : "outline"}
        onClick={() => setShowProductionOnly(!showProductionOnly)}
        className="flex items-center gap-2 min-w-[140px] justify-center"
        title={showProductionOnly ? 'Mostrar todos' : 'Solo producción'}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">
          Producción ({productionCount})
        </span>
      </Button>
    </div>
  );
}
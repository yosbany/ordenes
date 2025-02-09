import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';

interface ProviderProductSearchProps {
  products: Product[];
  onFilter: (filtered: Product[]) => void;
}

export function ProviderProductSearch({ products, onFilter }: ProviderProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Only filter when search term changes
  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      if (!searchTermLower) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(searchTermLower) ||
        product.sku.toLowerCase().includes(searchTermLower) ||
        product.supplierCode?.toLowerCase().includes(searchTermLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    });

    onFilter(filtered);
  }, [searchTerm, products]); // Only depend on searchTerm and products

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
    </div>
  );
}
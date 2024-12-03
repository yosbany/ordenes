import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';
import { formatOrderNumber } from '@/lib/order/utils';

interface ProviderProductSearchProps {
  products: Product[];
  onFilter: (filteredProducts: Product[]) => void;
}

export function ProviderProductSearch({ products, onFilter }: ProviderProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilter(products);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTermLower) ||
      formatOrderNumber(product.order).toLowerCase().includes(searchTermLower) ||
      product.sku.toLowerCase().includes(searchTermLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
    );

    onFilter(filtered);
  }, [searchTerm, products, onFilter]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Filtrar productos del proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-400 placeholder-amber-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
      </div>
    </div>
  );
}
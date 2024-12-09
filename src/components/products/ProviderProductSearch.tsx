import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';
import { formatOrderNumber, formatPrice } from '@/lib/utils';

interface ProviderProductSearchProps {
  products: Product[];
  onFilter: (filteredProducts: Product[], isActiveFilter: boolean) => void;
}

export function ProviderProductSearch({ products, onFilter }: ProviderProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize the filter function
  const filterProducts = useCallback((term: string) => {
    const searchTermTrimmed = term.trim();
    
    if (!searchTermTrimmed) {
      return { filtered: products, isActive: false };
    }

    const searchTermLower = searchTermTrimmed.toLowerCase();
    const filtered = products.filter(product => (
      product.name.toLowerCase().includes(searchTermLower) ||
      product.sku.toLowerCase().includes(searchTermLower) ||
      (product.supplierCode?.toLowerCase().includes(searchTermLower)) ||
      formatOrderNumber(product.order).toLowerCase().includes(searchTermLower) ||
      product.purchasePackaging.toLowerCase().includes(searchTermLower) ||
      product.salePackaging?.toLowerCase().includes(searchTermLower) ||
      formatPrice(product.price).toLowerCase().includes(searchTermLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
    ));

    return { filtered, isActive: true };
  }, [products]);

  // Memoize filtered results
  const { filtered, isActive } = useMemo(() => 
    filterProducts(searchTerm),
    [filterProducts, searchTerm]
  );

  // Update parent component with filtered results
  useEffect(() => {
    onFilter(filtered, isActive);
  }, [filtered, isActive, onFilter]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Buscar por nombre, SKU, código, orden, empaque, precio o etiquetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-400 placeholder-amber-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Search, Tag, Building2 } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Product, Provider } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber } from '@/lib/order/utils';
import { toast } from 'react-hot-toast';

interface GlobalProductSearchProps {
  onProductSelect: (product: Product) => void;
}

export function GlobalProductSearch({ onProductSelect }: GlobalProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Product & { provider?: Provider })[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsSnapshot, providersSnapshot] = await Promise.all([
          get(ref(db, 'products')),
          get(ref(db, 'providers'))
        ]);
        
        if (productsSnapshot.exists()) {
          const productsData = productsSnapshot.val();
          const productsList = Object.entries(productsData).map(([id, product]) => ({
            id,
            ...(product as Omit<Product, 'id'>)
          }));
          setAllProducts(productsList);
        }

        if (providersSnapshot.exists()) {
          const providersData = providersSnapshot.val();
          setProviders(providersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al buscar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    const results = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        formatOrderNumber(product.order).toLowerCase().includes(searchTermLower) ||
        product.supplierCode?.toLowerCase().includes(searchTermLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      )
      .map(product => ({
        ...product,
        provider: providers[product.providerId]
      }))
      .sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().startsWith(searchTermLower);
        const bNameMatch = b.name.toLowerCase().startsWith(searchTermLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        const aTagMatch = a.tags?.some(tag => tag.toLowerCase().startsWith(searchTermLower));
        const bTagMatch = b.tags?.some(tag => tag.toLowerCase().startsWith(searchTermLower));
        if (aTagMatch && !bTagMatch) return -1;
        if (!aTagMatch && bTagMatch) return 1;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    setSearchResults(results);
  }, [searchTerm, allProducts, providers]);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          placeholder="Buscar productos en todos los proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 placeholder-blue-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchResults.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">
                      {product.provider?.commercialName}
                    </span>
                  </div>
                  {product.supplierCode && (
                    <div className="text-sm text-gray-500 mt-1">
                      Código: {product.supplierCode}
                    </div>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag className="w-3 h-3 text-blue-400" />
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-blue-600 font-medium">
                  {formatPrice(product.price)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Buscando productos...
        </div>
      )}
    </div>
  );
}
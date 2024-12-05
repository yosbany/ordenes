import React, { useState, useEffect } from 'react';
import { Search, Tag, Building2 } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Product, Provider } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber } from '@/lib/order/utils';
import { toast } from 'react-hot-toast';

interface ProductSearchProps {
  currentProducts: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSearch({ currentProducts, onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Product & { provider?: Provider })[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products and providers
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

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const currentProductIds = new Set(currentProducts.map(p => p.id));
    const searchTermLower = searchTerm.toLowerCase();
    
    const results = allProducts
      .filter(product => 
        !currentProductIds.has(product.id) &&
        (
          product.name.toLowerCase().includes(searchTermLower) ||
          formatOrderNumber(product.order).toLowerCase().includes(searchTermLower) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
        )
      )
      .map(product => ({
        ...product,
        provider: providers[product.providerId]
      }))
      .sort((a, b) => {
        // Prioritize exact matches
        const aNameMatch = a.name.toLowerCase().startsWith(searchTermLower);
        const bNameMatch = b.name.toLowerCase().startsWith(searchTermLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // Then prioritize tag matches
        const aTagMatch = a.tags?.some(tag => tag.toLowerCase().startsWith(searchTermLower));
        const bTagMatch = b.tags?.some(tag => tag.toLowerCase().startsWith(searchTermLower));
        if (aTagMatch && !bTagMatch) return -1;
        if (!aTagMatch && bTagMatch) return 1;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 5); // Limit results

    setSearchResults(results);
  }, [searchTerm, allProducts, currentProducts, providers]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setSearchResults([]);
    toast.success('Producto agregado a la orden');
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          placeholder="Buscar productos por nombre o etiquetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{product.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">
                    {product.provider?.commercialName}
                  </span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-blue-600 font-medium whitespace-nowrap">
                {formatPrice(product.price)}
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
          Buscando productos...
        </div>
      )}
    </div>
  );
}
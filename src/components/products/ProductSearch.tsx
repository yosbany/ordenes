import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber } from '@/lib/order/utils';
import { toast } from 'react-hot-toast';

interface ProductSearchProps {
  currentProducts: Product[];
  onProductSelect: (product: Product) => void;
}

export function ProductSearch({ currentProducts, onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = ref(db, 'products');
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsList = Object.entries(data).map(([id, product]) => ({
            id,
            ...(product as Omit<Product, 'id'>)
          }));
          setAllProducts(productsList);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error al buscar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
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
          formatOrderNumber(product.order).toLowerCase().includes(searchTermLower)
        )
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aNameMatch = a.name.toLowerCase().startsWith(searchTermLower);
        const bNameMatch = b.name.toLowerCase().startsWith(searchTermLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5); // Limit results

    setSearchResults(results);
  }, [searchTerm, allProducts, currentProducts]);

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
          placeholder="Buscar productos de otros proveedores..."
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
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {formatOrderNumber(product.order)}
                </div>
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
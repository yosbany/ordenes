import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { formatOrderNumber } from '@/lib/order/utils';
import { toast } from 'react-hot-toast';
import { FullscreenProductEditor } from './FullscreenProductEditor';

interface GlobalProductSearchProps {
  onProductSelect: (product: Product) => void;
}

export function GlobalProductSearch({ onProductSelect }: GlobalProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const searchTermLower = searchTerm.toLowerCase();
    
    const results = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        formatOrderNumber(product.order).toLowerCase().includes(searchTermLower)
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
  }, [searchTerm, allProducts]);

  const handleProductClick = (product: Product) => {
    setEditingProduct(product);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleProductUpdate = async (data: Omit<Product, 'id'>) => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const productRef = ref(db, `products/${editingProduct.id}`);
      await set(productRef, data);
      toast.success('Producto actualizado exitosamente');
      
      // Update local state
      setAllProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, ...data } : p
      ));
      
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative mb-6">
        <div className="relative">
          <Input
            placeholder="Buscar productos por nombre..."
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
                onClick={() => handleProductClick(product)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{formatOrderNumber(product.order)}</div>
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
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
            Buscando productos...
          </div>
        )}
      </div>

      {/* Full-screen Product Editor */}
      {editingProduct && (
        <FullscreenProductEditor
          providerId={editingProduct.providerId}
          product={editingProduct}
          onSubmit={handleProductUpdate}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
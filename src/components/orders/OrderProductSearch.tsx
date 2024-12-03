import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Product, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderProductSearchProps {
  products: Product[];
  orders: Order[];
  onProductSelect: (product: Product) => void;
}

interface ProductWithLastOrder extends Product {
  lastOrder?: {
    date: string;
    quantity: number;
  };
}

export function OrderProductSearch({ products, orders, onProductSelect }: OrderProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductWithLastOrder[]>([]);

  // Get last order for each product
  const getProductWithLastOrder = (product: Product): ProductWithLastOrder => {
    // Sort orders by date in descending order
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Find the last order containing this product
    const lastOrder = sortedOrders.find(order => 
      order.items.some(item => item.productId === product.id)
    );

    if (!lastOrder) {
      return { ...product };
    }

    const orderItem = lastOrder.items.find(item => item.productId === product.id);
    
    return {
      ...product,
      lastOrder: {
        date: lastOrder.date,
        quantity: orderItem?.quantity || 0
      }
    };
  };

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
        product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      )
      .map(product => getProductWithLastOrder(product))
      .sort((a, b) => {
        // Prioritize exact matches
        const aNameMatch = a.name.toLowerCase().startsWith(searchTermLower);
        const bNameMatch = b.name.toLowerCase().startsWith(searchTermLower);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // Then sort by most recently ordered
        if (a.lastOrder && b.lastOrder) {
          return new Date(b.lastOrder.date).getTime() - new Date(a.lastOrder.date).getTime();
        }
        if (a.lastOrder) return -1;
        if (b.lastOrder) return 1;
        
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    setSearchResults(results);
  }, [searchTerm, products, orders]);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          placeholder="Buscar productos por nombre, SKU o etiquetas..."
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
                  <div className="font-medium text-gray-900">{product.name}</div>
                  {product.lastOrder ? (
                    <div className="text-sm text-gray-500">
                      Última compra: {format(new Date(product.lastOrder.date), "d 'de' MMMM, yyyy", { locale: es })} 
                      <span className="mx-1">•</span>
                      {product.lastOrder.quantity} {product.purchasePackaging}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No existen compras para este producto
                    </div>
                  )}
                </div>
                <div className="text-blue-600 font-medium whitespace-nowrap">
                  {formatPrice(product.price)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}
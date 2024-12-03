import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Order, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderListSearchProps {
  orders: Order[];
  products: Product[];
  onOrderSelect: (order: Order, orderNumber: number) => void;
}

interface OrderWithProduct extends Order {
  orderNumber: number;
  matchingProducts: Array<{
    product: Product;
    quantity: number;
  }>;
}

export function OrderListSearch({ orders, products, onOrderSelect }: OrderListSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<OrderWithProduct[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const results = sortedOrders
      .map((order, index) => {
        // Find matching products in this order
        const matchingProducts = order.items
          .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            
            const matches = 
              product.name.toLowerCase().includes(searchTermLower) ||
              product.sku.toLowerCase().includes(searchTermLower) ||
              product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower));
            
            return matches ? { product, quantity: item.quantity } : null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (matchingProducts.length === 0) return null;

        return {
          ...order,
          orderNumber: sortedOrders.length - index,
          matchingProducts
        };
      })
      .filter((order): order is OrderWithProduct => order !== null)
      .slice(0, 5);

    setSearchResults(results);
  }, [searchTerm, orders, products]);

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Input
          placeholder="Buscar productos en órdenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-400 placeholder-amber-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg max-h-[400px] overflow-auto">
          {searchResults.map((order) => (
            <button
              key={order.id}
              onClick={() => onOrderSelect(order, order.orderNumber)}
              className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-amber-100 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-amber-700">
                      Orden #{order.orderNumber}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(order.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {order.matchingProducts.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{product.name}</span>
                        <span className="text-gray-600 whitespace-nowrap ml-2">
                          {quantity} {product.purchasePackaging}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-amber-600 font-medium whitespace-nowrap">
                  {formatPrice(order.total)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No se encontraron productos en las órdenes
        </div>
      )}
    </div>
  );
}
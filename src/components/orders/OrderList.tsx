import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Order, Product, Provider } from '@/types';
import { OrderActions } from './OrderActions';
import { Button } from '@/components/ui/Button';

interface OrderListProps {
  orders: Order[];
  products: Product[];
  provider: Provider;
  onSelect: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export function OrderList({ orders, products, provider, onSelect, onDelete }: OrderListProps) {
  // Sort orders by date in descending order
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Create a map of order numbers
  const orderNumbers = new Map(
    sortedOrders.map((order, index) => [
      order.id,
      sortedOrders.length - index // Reverse the index to start from highest number
    ])
  );

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => {
        const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return (
          <div
            key={order.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="cursor-pointer space-y-3"
              onClick={() => onSelect(order)}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {order.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <h3 className="text-lg font-semibold">
                    Orden #{orderNumbers.get(order.id)} - {format(new Date(order.date), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </h3>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex items-center justify-between text-gray-600">
                <span>
                  {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
                </span>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <OrderActions
                order={order}
                products={products}
                provider={provider}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(order);
                }}
                className="hover:bg-red-50 hover:text-red-600 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
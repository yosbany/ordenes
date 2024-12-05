import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock } from 'lucide-react';
import { Order, Product, Provider } from '@/types';
import { OrderActions } from './OrderActions';
import { formatPrice } from '@/lib/utils';
import { useProviders } from '@/hooks/useProviders';

interface OrderListProps {
  orders: Order[];
  products: Product[];
  provider: Provider | undefined;
  onSelect: (order: Order, orderNumber: number) => void;
}

export function OrderList({ 
  orders, 
  products, 
  provider, 
  onSelect
}: OrderListProps) {
  const { providers } = useProviders();

  // Sort orders by date in descending order
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedOrders.map((order, index) => {
        const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const orderNumber = sortedOrders.length - index;
        const orderProvider = providers.find(p => p.id === order.providerId);
        
        return (
          <div
            key={order.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="cursor-pointer space-y-3"
              onClick={() => onSelect(order, orderNumber)}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {order.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      Orden #{orderNumber} - {format(new Date(order.date), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </h3>
                    {orderProvider && (
                      <p className="text-sm text-gray-600">
                        {orderProvider.commercialName}
                        {orderProvider.legalName && orderProvider.legalName !== orderProvider.commercialName && (
                          <span className="text-gray-400"> • {orderProvider.legalName}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex items-center justify-between text-gray-600">
                <span>
                  {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
                </span>
                <span className="font-medium text-blue-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
              <OrderActions
                order={order}
                products={products}
                provider={orderProvider}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
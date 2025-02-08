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
  provider?: Provider;
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
        // Get unique products count
        const uniqueProducts = new Set(order.items.map(item => item.productId)).size;
        // Get total quantity
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const orderNumber = sortedOrders.length - index;
        const orderProvider = provider || providers.find(p => p.id === order.providerId);
        
        if (!orderProvider) return null;

        return (
          <div
            key={order.id}
            className={`
              bg-white rounded-lg border transition-all duration-200
              ${order.status === 'completed' 
                ? 'border-green-200 hover:border-green-300' 
                : 'border-amber-200 hover:border-amber-300'
              }
              hover:shadow-md
            `}
          >
            <div 
              className="cursor-pointer"
              onClick={() => onSelect(order, orderNumber)}
            >
              {/* Order Header */}
              <div className="p-4">
                {/* Date and Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-lg font-bold text-gray-900">
                    {format(new Date(order.date), "d 'de' MMMM", { locale: es })}
                    <span className="text-gray-500 ml-2 text-base font-normal">
                      {format(new Date(order.date), "HH:mm", { locale: es })}
                    </span>
                  </div>
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${order.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                    }
                  `}>
                    {order.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Completada
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-1.5" />
                        Pendiente
                      </>
                    )}
                  </span>
                </div>

                {/* Order Number and Provider */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600">
                      Orden #{orderNumber}
                    </h3>
                    <div className="text-base font-medium text-gray-900 mt-1">
                      {orderProvider.commercialName}
                      {orderProvider.legalName && orderProvider.legalName !== orderProvider.commercialName && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({orderProvider.legalName})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {uniqueProducts} {uniqueProducts === 1 ? 'producto' : 'productos'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>
                    {totalQuantity} {totalQuantity === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
              <OrderActions
                order={order}
                products={products}
                provider={orderProvider}
              />
            </div>
          </div>
        );
      })}

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay órdenes para mostrar
        </div>
      )}
    </div>
  );
}
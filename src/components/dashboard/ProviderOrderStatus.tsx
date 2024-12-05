import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Provider } from '@/types';
import { useProviderOrders } from '@/hooks/useProviderOrders';
import { startOfDay, endOfDay } from '@/lib/dateUtils';

interface ProviderOrderStatusProps {
  provider: Provider;
}

export function ProviderOrderStatus({ provider }: ProviderOrderStatusProps) {
  const navigate = useNavigate();
  const { orders } = useProviderOrders(provider.id!);
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Get today's orders count
  const todayOrdersCount = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= todayStart && orderDate <= todayEnd;
  }).length;

  const handleClick = () => {
    if (todayOrdersCount > 0) {
      // Navigate to edit existing order
      navigate(`/orders?provider=${provider.id}`);
    } else {
      // Navigate to create new order
      navigate(`/orders?provider=${provider.id}&new=true`);
    }
  };

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleClick}
          className="font-medium text-gray-900 hover:text-blue-600 text-left transition-colors"
        >
          {provider.legalName && provider.legalName !== provider.commercialName ? (
            `${provider.legalName} (${provider.commercialName})`
          ) : (
            provider.commercialName
          )}
        </button>
        <div className="flex items-center gap-3">
          {todayOrdersCount > 0 ? (
            <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
              {todayOrdersCount} {todayOrdersCount === 1 ? 'pedido' : 'pedidos'}
            </span>
          ) : (
            <span className="text-sm font-medium text-amber-600 whitespace-nowrap">
              Pendiente
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
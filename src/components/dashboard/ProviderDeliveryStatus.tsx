import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Provider } from '@/types';
import { useProviderOrders } from '@/hooks/useProviderOrders';
import { startOfDay, endOfDay, getPreviousDay, getDayName } from '@/lib/dateUtils';
import { formatPrice } from '@/lib/utils';

interface ProviderDeliveryStatusProps {
  provider: Provider;
}

export function ProviderDeliveryStatus({ provider }: ProviderDeliveryStatusProps) {
  const { orders } = useProviderOrders(provider.id!);
  const today = new Date();
  const todayName = getDayName(today);
  
  // Check if today is also an order day
  const isTodayOrderDay = provider.orderDays?.includes(todayName);
  
  // Get previous order day if today is not an order day
  const previousDay = isTodayOrderDay ? today : getPreviousDay(today, provider.orderDays || []);
  
  // Get orders from the previous order day
  const previousDayOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= startOfDay(previousDay) && orderDate <= endOfDay(previousDay);
  });

  // Calculate total amount for previous day's orders
  const totalAmount = previousDayOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900">
          {provider.legalName && provider.legalName !== provider.commercialName ? (
            `${provider.legalName} (${provider.commercialName})`
          ) : (
            provider.commercialName
          )}
        </span>
        <div className="flex items-center gap-3">
          {previousDayOrders.length > 0 ? (
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">
                {formatPrice(totalAmount)}
              </div>
              <div className="text-xs text-gray-500">
                {isTodayOrderDay ? (
                  'Pedido de hoy'
                ) : (
                  format(previousDay, "d 'de' MMM", { locale: es })
                )}
              </div>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-500">
              Sin pedidos previos
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
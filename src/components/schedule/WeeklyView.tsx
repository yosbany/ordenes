import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { FileText, ShoppingCart, Truck, CalendarIcon } from 'lucide-react';
import { Provider, Order, WeekDay } from '@/types';
import { formatPrice } from '@/lib/utils';

interface WeeklyViewProps {
  currentDate: Date;
  today: WeekDay;
  weekdays: { day: WeekDay; label: string }[];
  providers: Provider[];
  ordersByProvider: Record<string, Order[]>;
  monthlyBillingProviders: Provider[];
  getDayEvents: (date: Date) => {
    billing: Provider[];
    orders: Provider[];
    deliveries: Provider[];
  };
}

export function WeeklyView({
  currentDate,
  today,
  weekdays,
  providers,
  ordersByProvider,
  monthlyBillingProviders,
  getDayEvents
}: WeeklyViewProps) {
  // Calculate the start of the week (Sunday)
  const weekStart = startOfWeek(currentDate);

  // Get weekly schedule data
  const weeklySchedule = weekdays.map(({ day, label }, index) => {
    // Calculate the date for this weekday
    const date = addDays(weekStart, index);
    
    // Get events for this date
    const events = getDayEvents(date);

    return {
      day,
      label,
      date,
      events,
      isToday: format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
    };
  });

  return (
    <>
      {/* Today's Schedule */}
      <Card variant="blue">
        <Card.Header className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                Hoy - {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
              </h2>
              <p className="text-sm text-blue-600 mt-1">
                {Object.keys(ordersByProvider).length} proveedores con pedidos hoy
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card.Header>
        <Card.Content className="space-y-4">
          {/* Monthly Billing */}
          {monthlyBillingProviders.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-medium text-amber-900">Facturas</h3>
              </div>
              <div className="space-y-3">
                {monthlyBillingProviders.map(provider => (
                  <div key={provider.id} className="bg-white p-3 rounded-lg border border-amber-200">
                    <div className="font-medium text-amber-900">{provider.commercialName}</div>
                    {provider.legalName && provider.legalName !== provider.commercialName && (
                      <div className="text-sm text-amber-700 mt-1">{provider.legalName}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Pedidos</h3>
            </div>
            {Object.keys(ordersByProvider).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(ordersByProvider).map(([providerId, providerOrders]) => {
                  const provider = providers.find(p => p.id === providerId);
                  if (!provider) return null;

                  const totalAmount = providerOrders.reduce((sum, order) => sum + order.total, 0);
                  const totalItems = providerOrders.reduce((sum, order) => sum + order.items.length, 0);
                  const totalUnits = providerOrders.reduce((sum, order) => 
                    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 
                  0);

                  return (
                    <div key={providerId} className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">{provider.commercialName}</div>
                          {provider.legalName && provider.legalName !== provider.commercialName && (
                            <div className="text-sm text-blue-700 mt-1">{provider.legalName}</div>
                          )}
                          <div className="text-sm text-blue-600 mt-2">
                            <span>
                              {providerOrders.length} {providerOrders.length === 1 ? 'pedido' : 'pedidos'}
                            </span>
                            <span className="mx-1">•</span>
                            <span>
                              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                            </span>
                            <span className="mx-1">•</span>
                            <span>
                              {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-blue-900">
                            {formatPrice(totalAmount)}
                          </span>
                        </div>
                      </div>

                      {provider.deliveryDays?.includes(today) && (
                        <div className="mt-3 pt-3 border-t border-blue-100">
                          <div className="text-sm text-blue-700 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>Entrega programada para hoy</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center text-blue-600">
                No hay pedidos para hoy
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Weekly Schedule */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weeklySchedule.map(({ day, label, date, events, isToday }) => (
          <Card 
            key={day}
            className={isToday ? 'ring-2 ring-blue-500' : ''}
          >
            <Card.Header className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <Card.Title className={isToday ? 'text-blue-600' : ''}>
                  {label}
                </Card.Title>
                <span className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {format(date, 'd MMM', { locale: es })}
                </span>
              </div>
            </Card.Header>
            <Card.Content className="pt-4 space-y-6">
              {/* Monthly Billing */}
              {events.billing.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-100 rounded-md">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="text-sm font-medium text-amber-900">
                      Facturas
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {events.billing.map(provider => (
                      <li 
                        key={provider.id} 
                        className="bg-amber-50 px-3 py-2 rounded-md border border-amber-100 hover:bg-amber-100 transition-colors"
                      >
                        <div className="font-medium text-amber-900">
                          {provider.commercialName}
                        </div>
                        {provider.legalName && provider.legalName !== provider.commercialName && (
                          <div className="text-sm text-amber-700 mt-0.5">
                            {provider.legalName}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Orders */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Pedidos
                  </h4>
                </div>
                {events.orders.length > 0 ? (
                  <ul className="space-y-2">
                    {events.orders.map(provider => (
                      <li 
                        key={provider.id} 
                        className="bg-blue-50 px-3 py-2 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        <div className="font-medium text-blue-900">
                          {provider.commercialName}
                        </div>
                        {provider.legalName && provider.legalName !== provider.commercialName && (
                          <div className="text-sm text-blue-700 mt-0.5">
                            {provider.legalName}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                    No hay pedidos programados
                  </p>
                )}
              </div>

              {/* Deliveries */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-medium text-green-900">
                    Entregas
                  </h4>
                </div>
                {events.deliveries.length > 0 ? (
                  <ul className="space-y-2">
                    {events.deliveries.map(provider => (
                      <li 
                        key={provider.id} 
                        className="bg-green-50 px-3 py-2 rounded-md border border-green-100 hover:bg-green-100 transition-colors"
                      >
                        <div className="font-medium text-green-900">
                          {provider.commercialName}
                        </div>
                        {provider.legalName && provider.legalName !== provider.commercialName && (
                          <div className="text-sm text-green-700 mt-0.5">
                            {provider.legalName}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                    No hay entregas programadas
                  </p>
                )}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </>
  );
}
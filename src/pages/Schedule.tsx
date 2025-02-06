import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, List, FileText, ShoppingCart, Truck } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { formatPrice } from '@/lib/utils';
import { WeekDay } from '@/types';
import { DayDetailsModal } from '@/components/schedule/DayDetailsModal';

const WEEKDAYS: { day: WeekDay; label: string }[] = [
  { day: 'monday', label: 'Lunes' },
  { day: 'tuesday', label: 'Martes' },
  { day: 'wednesday', label: 'Miércoles' },
  { day: 'thursday', label: 'Jueves' },
  { day: 'friday', label: 'Viernes' },
  { day: 'saturday', label: 'Sábado' },
  { day: 'sunday', label: 'Domingo' }
];

const WEEKDAY_TO_NUMBER: Record<WeekDay, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const NUMBER_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export function Schedule() {
  const { providers } = useProviders();
  const { orders: allOrders } = useGlobalOrders();
  const [isMonthView, setIsMonthView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<{
    billing: typeof providers;
    orders: typeof providers;
    deliveries: typeof providers;
  } | null>(null);
  const today = format(new Date(), 'EEEE', { locale: es }).toLowerCase() as WeekDay;
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentWeekday = currentDate.getDay();

  // Get today's orders by comparing dates without time
  const todayOrders = allOrders.filter(order => {
    const orderDate = new Date(order.date);
    const today = new Date();
    
    return orderDate.getFullYear() === today.getFullYear() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getDate() === today.getDate();
  });

  // Group orders by provider
  const ordersByProvider = todayOrders.reduce((acc, order) => {
    if (!acc[order.providerId]) {
      acc[order.providerId] = [];
    }
    acc[order.providerId].push(order);
    return acc;
  }, {} as Record<string, typeof todayOrders>);

  // Get monthly billing providers that bill today
  const monthlyBillingProviders = providers.filter(provider => 
    provider.billingType === 'monthly' && 
    provider.billingDays?.includes(currentDay)
  );

  // Get calendar data for month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 } // Week starts on Monday
  );

  // Function to get events for a specific day
  const getDayEvents = (date: Date) => {
    const dayOfMonth = date.getDate();
    const dayOfWeek = NUMBER_TO_WEEKDAY[date.getDay()];

    const billing = providers.filter(p => 
      p.billingType === 'monthly' && 
      p.billingDays?.includes(dayOfMonth)
    );

    const orders = providers.filter(p => p.orderDays?.includes(dayOfWeek));
    const deliveries = providers.filter(p => p.deliveryDays?.includes(dayOfWeek));

    return { billing, orders, deliveries };
  };

  // Function to handle day click in month view
  const handleDayClick = (date: Date) => {
    const events = getDayEvents(date);
    setSelectedDate(date);
    setSelectedEvents(events);
  };

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cronograma de Proveedores</h1>
        <Button
          variant="outline"
          onClick={() => setIsMonthView(!isMonthView)}
          className="gap-2"
        >
          {isMonthView ? (
            <>
              <List className="w-4 h-4" />
              Vista Semanal
            </>
          ) : (
            <>
              <CalendarIcon className="w-4 h-4" />
              Vista Mensual
            </>
          )}
        </Button>
      </div>

      {isMonthView ? (
        // Monthly Calendar View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map(({ label }) => (
              <div key={label} className="p-2 text-center font-medium text-sm border-r last:border-r-0">
                {label}
              </div>
            ))}
          </div>

          <div className="divide-y">
            {weeks.map((week, weekIndex) => {
              const days = eachDayOfInterval({
                start: week,
                end: new Date(week.getTime() + 6 * 24 * 60 * 60 * 1000)
              });

              return (
                <div key={weekIndex} className="grid grid-cols-7 min-h-[120px]">
                  {days.map((day, dayIndex) => {
                    const events = getDayEvents(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const hasEvents = events.billing.length > 0 || 
                                    events.orders.length > 0 || 
                                    events.deliveries.length > 0;

                    return (
                      <div 
                        key={dayIndex}
                        onClick={() => handleDayClick(day)}
                        className={`p-2 border-r last:border-r-0 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isCurrentDay ? 'bg-blue-50' : ''} ${
                          hasEvents ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isCurrentDay ? 'text-blue-600' : ''}`}>
                          {format(day, 'd')}
                        </div>

                        <div className="space-y-1 text-xs">
                          {events.billing.length > 0 && (
                            <div className="text-amber-600 font-medium truncate">
                              {events.billing.length} {events.billing.length === 1 ? 'factura' : 'facturas'}
                            </div>
                          )}
                          {events.orders.length > 0 && (
                            <div className="text-blue-600 font-medium truncate">
                              {events.orders.length} {events.orders.length === 1 ? 'pedido' : 'pedidos'}
                            </div>
                          )}
                          {events.deliveries.length > 0 && (
                            <div className="text-green-600 font-medium truncate">
                              {events.deliveries.length} {events.deliveries.length === 1 ? 'entrega' : 'entregas'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Today's Schedule */}
          <Card>
            <Card.Header>
              <Card.Title>
                Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                {/* Monthly Billing */}
                {monthlyBillingProviders.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Facturas:</h3>
                    <ul className="space-y-2">
                      {monthlyBillingProviders.map(provider => (
                        <li key={provider.id} className="bg-amber-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-amber-900">{provider.commercialName}</span>
                              {provider.legalName && provider.legalName !== provider.commercialName && (
                                <span className="text-sm text-amber-700 block">
                                  {provider.legalName}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pedidos */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pedidos:</h3>
                  {Object.keys(ordersByProvider).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(ordersByProvider).map(([providerId, providerOrders]) => {
                        const provider = providers.find(p => p.id === providerId);
                        if (!provider) return null;

                        const totalAmount = providerOrders.reduce((sum, order) => sum + order.total, 0);
                        const totalItems = providerOrders.reduce((sum, order) => sum + order.items.length, 0);
                        const totalUnits = providerOrders.reduce((sum, order) => 
                          sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 
                        0);

                        return (
                          <li key={providerId} className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-blue-900">{provider.commercialName}</span>
                                {provider.legalName && provider.legalName !== provider.commercialName && (
                                  <span className="text-sm text-blue-700 block">
                                    {provider.legalName}
                                  </span>
                                )}
                                <div className="text-sm text-blue-600">
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

                            {/* Show delivery info if provider has delivery today */}
                            {provider.deliveryDays?.includes(today) && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <div className="text-sm text-blue-700">
                                  <span className="font-medium">Entrega programada para hoy</span>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No hay pedidos realizados hoy</p>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Weekly Schedule */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {WEEKDAYS.map(({ day, label }) => {
              // Get billing providers for this weekday
              const weekdayNumber = WEEKDAY_TO_NUMBER[day];
              const billingProviders = providers.filter(p => 
                p.billingType === 'monthly' && 
                p.billingDays?.includes(currentDay) && 
                weekdayNumber === currentWeekday
              );

              const orderProviders = providers.filter(p => p.orderDays?.includes(day));
              const deliveryProviders = providers.filter(p => p.deliveryDays?.includes(day));

              return (
                <Card key={day}>
                  <Card.Header>
                    <Card.Title className={day === today ? 'text-blue-600' : ''}>
                      {label}
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4">
                      {/* Monthly Billing */}
                      {billingProviders.length > 0 && (
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
                            {billingProviders.map(provider => (
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

                      {/* Pedidos */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-blue-100 rounded-md">
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-medium text-blue-900">
                            Pedidos
                          </h4>
                        </div>
                        {orderProviders.length > 0 ? (
                          <ul className="space-y-2">
                            {orderProviders.map(provider => (
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

                      {/* Entregas */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-green-100 rounded-md">
                            <Truck className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="text-sm font-medium text-green-900">
                            Entregas
                          </h4>
                        </div>
                        {deliveryProviders.length > 0 ? (
                          <ul className="space-y-2">
                            {deliveryProviders.map(provider => (
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
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Day Details Modal */}
      {selectedDate && selectedEvents && (
        <DayDetailsModal
          isOpen={true}
          onClose={() => {
            setSelectedDate(null);
            setSelectedEvents(null);
          }}
          date={selectedDate}
          events={selectedEvents}
        />
      )}
    </div>
  );
}
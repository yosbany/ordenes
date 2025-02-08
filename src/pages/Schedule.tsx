import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { WeekDay, Provider } from '@/types';
import { DayDetailsModal } from '@/components/schedule/DayDetailsModal';
import { MonthlyView } from '@/components/schedule/MonthlyView';
import { WeeklyView } from '@/components/schedule/WeeklyView';

// Reordered weekdays to start from Tuesday
const WEEKDAYS: { day: WeekDay; label: string }[] = [
  { day: 'tuesday', label: 'Martes' },
  { day: 'wednesday', label: 'Miércoles' },
  { day: 'thursday', label: 'Jueves' },
  { day: 'friday', label: 'Viernes' },
  { day: 'saturday', label: 'Sábado' },
  { day: 'sunday', label: 'Domingo' },
  { day: 'monday', label: 'Lunes' }
];

// Updated weekday number mapping to match new order
const WEEKDAY_TO_NUMBER: Record<WeekDay, number> = {
  tuesday: 0,
  wednesday: 1,
  thursday: 2,
  friday: 3,
  saturday: 4,
  sunday: 5,
  monday: 6
};

// Updated number to weekday mapping
const NUMBER_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'tuesday',
  1: 'wednesday',
  2: 'thursday',
  3: 'friday',
  4: 'saturday',
  5: 'sunday',
  6: 'monday'
};

export function Schedule() {
  const { providers } = useProviders();
  const { orders: allOrders } = useGlobalOrders();
  const [isMonthView, setIsMonthView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<{
    billing: Provider[];
    orders: Provider[];
    deliveries: Provider[];
  } | null>(null);

  const today = format(new Date(), 'EEEE', { locale: es }).toLowerCase() as WeekDay;
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  // Get today's orders
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
    { weekStartsOn: 2 } // 2 = Tuesday
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
        <MonthlyView
          currentDate={currentDate}
          weeks={weeks}
          providers={providers}
          weekdays={WEEKDAYS}
          getDayEvents={getDayEvents}
          onDayClick={handleDayClick}
        />
      ) : (
        <WeeklyView
          currentDate={currentDate}
          today={today}
          weekdays={WEEKDAYS}
          providers={providers}
          ordersByProvider={ordersByProvider}
          monthlyBillingProviders={monthlyBillingProviders}
          getDayEvents={getDayEvents}
        />
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
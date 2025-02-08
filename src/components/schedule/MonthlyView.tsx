import React from 'react';
import { format, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Provider } from '@/types';
import { CalendarIcon, FileText, ShoppingCart, Truck } from 'lucide-react';

interface MonthlyViewProps {
  currentDate: Date;
  weeks: Date[];
  providers: Provider[];
  weekdays: { day: string; label: string }[];
  getDayEvents: (date: Date) => {
    billing: Provider[];
    orders: Provider[];
    deliveries: Provider[];
  };
  onDayClick: (date: Date) => void;
}

export function MonthlyView({
  currentDate,
  weeks,
  providers,
  weekdays,
  getDayEvents,
  onDayClick
}: MonthlyViewProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-b">
        {weekdays.map(({ label }) => (
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
                    onClick={() => onDayClick(day)}
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
                        <div className="flex items-center gap-1 text-amber-600">
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {events.billing.length} {events.billing.length === 1 ? 'Factura' : 'Facturas'}
                          </span>
                        </div>
                      )}
                      {events.orders.length > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <ShoppingCart className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {events.orders.length} {events.orders.length === 1 ? 'Pedido' : 'Pedidos'}
                          </span>
                        </div>
                      )}
                      {events.deliveries.length > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Truck className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {events.deliveries.length} {events.deliveries.length === 1 ? 'Entrega' : 'Entregas'}
                          </span>
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
  );
}
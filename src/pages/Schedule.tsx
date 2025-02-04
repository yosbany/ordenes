import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { useProviders } from '@/hooks/useProviders';
import { WeekDay } from '@/types';

const WEEKDAYS: { day: WeekDay; label: string }[] = [
  { day: 'monday', label: 'Lunes' },
  { day: 'tuesday', label: 'Martes' },
  { day: 'wednesday', label: 'Miércoles' },
  { day: 'thursday', label: 'Jueves' },
  { day: 'friday', label: 'Viernes' },
  { day: 'saturday', label: 'Sábado' },
  { day: 'sunday', label: 'Domingo' }
];

export function Schedule() {
  const { providers } = useProviders();
  const today = format(new Date(), 'EEEE', { locale: es }).toLowerCase() as WeekDay;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cronograma de Proveedores</h1>

      {/* Today's Schedule */}
      <Card>
        <Card.Header>
          <Card.Title>
            Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Pedidos:</h3>
              {providers.filter(p => p.orderDays?.includes(today)).length > 0 ? (
                <ul className="space-y-2">
                  {providers
                    .filter(p => p.orderDays?.includes(today))
                    .map(provider => (
                      <li key={provider.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium text-blue-900">{provider.commercialName}</span>
                          {provider.legalName && provider.legalName !== provider.commercialName && (
                            <span className="text-sm text-blue-700 block">
                              {provider.legalName}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay pedidos programados para hoy</p>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Entregas:</h3>
              {providers.filter(p => p.deliveryDays?.includes(today)).length > 0 ? (
                <ul className="space-y-2">
                  {providers
                    .filter(p => p.deliveryDays?.includes(today))
                    .map(provider => (
                      <li key={provider.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium text-green-900">{provider.commercialName}</span>
                          {provider.legalName && provider.legalName !== provider.commercialName && (
                            <span className="text-sm text-green-700 block">
                              {provider.legalName}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay entregas programadas para hoy</p>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Weekly Schedule */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEKDAYS.map(({ day, label }) => (
          <Card key={day}>
            <Card.Header>
              <Card.Title className={day === today ? 'text-blue-600' : ''}>
                {label}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Pedidos:</h4>
                  {providers.filter(p => p.orderDays?.includes(day)).length > 0 ? (
                    <ul className="space-y-1">
                      {providers
                        .filter(p => p.orderDays?.includes(day))
                        .map(provider => (
                          <li key={provider.id} className="text-sm">
                            {provider.commercialName}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No hay pedidos</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Entregas:</h4>
                  {providers.filter(p => p.deliveryDays?.includes(day)).length > 0 ? (
                    <ul className="space-y-1">
                      {providers
                        .filter(p => p.deliveryDays?.includes(day))
                        .map(provider => (
                          <li key={provider.id} className="text-sm">
                            {provider.commercialName}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No hay entregas</p>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
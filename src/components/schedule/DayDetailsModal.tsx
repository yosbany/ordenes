import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog } from '@/components/ui/Dialog';
import { Provider } from '@/types';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: {
    billing: Provider[];
    orders: Provider[];
    deliveries: Provider[];
  };
}

export function DayDetailsModal({ isOpen, onClose, date, events }: DayDetailsModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
    >
      <div className="space-y-6">
        {/* Billing Events */}
        {events.billing.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-amber-900 mb-3">Facturas</h3>
            <div className="space-y-2">
              {events.billing.map((provider) => (
                <div key={provider.id} className="bg-amber-50 p-3 rounded-lg">
                  <div className="font-medium text-amber-900">
                    {provider.commercialName}
                  </div>
                  {provider.legalName && provider.legalName !== provider.commercialName && (
                    <div className="text-sm text-amber-700">
                      {provider.legalName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Events */}
        {events.orders.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-3">Pedidos</h3>
            <div className="space-y-2">
              {events.orders.map((provider) => (
                <div key={provider.id} className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-900">
                    {provider.commercialName}
                  </div>
                  {provider.legalName && provider.legalName !== provider.commercialName && (
                    <div className="text-sm text-blue-700">
                      {provider.legalName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Events */}
        {events.deliveries.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-3">Entregas</h3>
            <div className="space-y-2">
              {events.deliveries.map((provider) => (
                <div key={provider.id} className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-900">
                    {provider.commercialName}
                  </div>
                  {provider.legalName && provider.legalName !== provider.commercialName && (
                    <div className="text-sm text-green-700">
                      {provider.legalName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Events Message */}
        {events.billing.length === 0 && events.orders.length === 0 && events.deliveries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay eventos programados para este día
          </div>
        )}
      </div>
    </Dialog>
  );
}
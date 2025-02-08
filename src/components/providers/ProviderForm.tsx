import React, { useState } from 'react';
import { Users, X, FileText, ShoppingCart, Truck, Calendar } from 'lucide-react';
import { Provider } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/utils';
import { WeekDay } from '@/types';

interface ProviderFormProps {
  initialData?: Provider;
  onSubmit: (data: Omit<Provider, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function ProviderForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: ProviderFormProps) {
  const [formData, setFormData] = React.useState<Omit<Provider, 'id'>>({
    commercialName: initialData?.commercialName || '',
    legalName: initialData?.legalName || '',
    rut: initialData?.rut || '',
    phone: initialData?.phone || '',
    deliveryDays: initialData?.deliveryDays || [],
    orderDays: initialData?.orderDays || [],
    billingType: initialData?.billingType || 'weekly',
    billingDays: initialData?.billingDays || [],
  });

  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.startsWith('598')) {
      value = value.slice(3);
    }
    value = value.slice(0, 9);
    
    setFormData(prev => ({ ...prev, phone: value }));
    
    if (value && !validatePhoneNumber(value)) {
      setPhoneError('Ingrese un número de celular válido de Uruguay (8 o 9 dígitos)');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setPhoneError('Ingrese un número de celular válido de Uruguay (8 o 9 dígitos)');
      return;
    }

    await onSubmit(formData);
  };

  const handleDayToggle = (day: WeekDay, type: 'delivery' | 'order') => {
    setFormData(prev => ({
      ...prev,
      [type === 'delivery' ? 'deliveryDays' : 'orderDays']: prev[type === 'delivery' ? 'deliveryDays' : 'orderDays']?.includes(day)
        ? prev[type === 'delivery' ? 'deliveryDays' : 'orderDays']?.filter(d => d !== day)
        : [...(prev[type === 'delivery' ? 'deliveryDays' : 'orderDays'] || []), day],
    }));
  };

  const handleBillingDaySelect = (day: number) => {
    setFormData(prev => ({
      ...prev,
      billingDays: [day]
    }));
  };

  const formattedPhone = formData.phone ? formatPhoneNumber(formData.phone) : '';

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Colored Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="text-lg font-semibold">
              {initialData ? 'Editar' : 'Nuevo'} Proveedor
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2 hover:bg-white/10 text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            
            <Input
              label="Nombre comercial"
              value={formData.commercialName}
              onChange={(e) => setFormData(prev => ({ ...prev, commercialName: e.target.value }))}
              required
            />
            <Input
              label="Razón social"
              value={formData.legalName}
              onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
            />
            <Input
              label="RUT"
              value={formData.rut}
              onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
            />
            <div>
              <Input
                label="Celular"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={phoneError}
                placeholder="93609319"
              />
              {formData.phone && (
                <p className="mt-1 text-sm text-gray-500">
                  Se guardará como: {formattedPhone}
                </p>
              )}
            </div>
          </div>
          
          {/* Schedule Configuration */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Horarios</h3>
            
            {/* Billing Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="text-base font-medium text-gray-900">Facturación</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.billingType === 'weekly'}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      billingType: 'weekly',
                      billingDays: [] 
                    }))}
                    className="w-4 h-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                  />
                  <span className="text-amber-900">Semanal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.billingType === 'monthly'}
                    onChange={() => setFormData(prev => ({ 
                      ...prev, 
                      billingType: 'monthly',
                      billingDays: [] 
                    }))}
                    className="w-4 h-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                  />
                  <span className="text-amber-900">Mensual</span>
                </label>
              </div>

              {formData.billingType === 'monthly' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-amber-900">
                    Día de facturación
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {MONTH_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleBillingDaySelect(day)}
                        className={`
                          px-2 py-1.5 text-sm font-medium rounded-md transition-colors
                          ${formData.billingDays?.includes(day)
                            ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                            : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Days */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-base font-medium text-gray-900">Días de Pedido</h4>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleDayToggle(value, 'order')}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${formData.orderDays?.includes(value)
                        ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                        : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Days */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="text-base font-medium text-gray-900">Días de Entrega</h4>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleDayToggle(value, 'delivery')}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${formData.deliveryDays?.includes(value)
                        ? 'bg-green-200 text-green-900 hover:bg-green-300'
                        : 'bg-white text-green-700 hover:bg-green-100 border border-green-200'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {initialData ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </div>
      </div>
    </div>
  );
}
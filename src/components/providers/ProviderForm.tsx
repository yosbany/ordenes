import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Provider, WeekDay } from '@/types';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/utils';

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

export function ProviderForm({ initialData, onSubmit, onCancel, isLoading }: ProviderFormProps) {
  const [formData, setFormData] = React.useState<Omit<Provider, 'id'>>({
    commercialName: initialData?.commercialName || '',
    legalName: initialData?.legalName || '',
    rut: initialData?.rut || '',
    phone: initialData?.phone || '',
    deliveryDays: initialData?.deliveryDays || [],
    orderDays: initialData?.orderDays || [],
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

  const formattedPhone = formData.phone ? formatPhoneNumber(formData.phone) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Días de pedido
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {WEEK_DAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDayToggle(value, 'order')}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${formData.orderDays?.includes(value)
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Días de entrega
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {WEEK_DAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDayToggle(value, 'delivery')}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${formData.deliveryDays?.includes(value)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Crear'} Proveedor
        </Button>
      </div>
    </form>
  );
}
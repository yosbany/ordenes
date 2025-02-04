import React from 'react';
import { useMeasures } from '@/hooks/useMeasures';
import { mergeClasses } from '@/lib/utils';

interface MeasureSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
}

export function MeasureSelect({
  value,
  onChange,
  required,
  className,
  label,
  placeholder = "Seleccionar..."
}: MeasureSelectProps) {
  const { measures, loading } = useMeasures();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
        className={mergeClasses(
          'w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900',
          'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          className
        )}
      >
        <option value="" disabled>
          {loading ? 'Cargando...' : placeholder}
        </option>
        {!loading && measures.map(measure => (
          <option key={measure} value={measure}>
            {measure}
          </option>
        ))}
      </select>
    </div>
  );
}
import React from 'react';
import { useUnitMeasures } from '@/hooks/useUnitMeasures';
import { mergeClasses } from '@/lib/utils';

interface UnitMeasureSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export function UnitMeasureSelect({
  value,
  onChange,
  required,
  className,
  label
}: UnitMeasureSelectProps) {
  const { unitMeasures, loading } = useUnitMeasures();

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
        {loading ? (
          <option value="">Cargando...</option>
        ) : (
          unitMeasures.map(unit => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
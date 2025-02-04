import React from 'react';
import { usePackaging } from '@/hooks/usePackaging';
import { mergeClasses } from '@/lib/utils';

interface PackagingSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export function PackagingSelect({
  value,
  onChange,
  required,
  className,
  label
}: PackagingSelectProps) {
  const { packagingTypes, loading } = usePackaging();

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
          packagingTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
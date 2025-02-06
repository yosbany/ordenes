import React, { useState, useEffect } from 'react';
import { mergeClasses } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isCurrency?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, value, type, onChange, isCurrency, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Format number with thousand separators and comma decimal
    const formatNumber = (num: number): string => {
      const parts = num.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return parts.join(',');
    };

    // Initialize display value
    useEffect(() => {
      if (isCurrency && typeof value === 'number' && !isEditing) {
        setDisplayValue(formatNumber(value));
      }
    }, [value, isCurrency, isEditing]);

    // Handle number inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCurrency) {
        // Remove all non-numeric characters except comma and dot
        let value = e.target.value.replace(/[^\d.,]/g, '');
        
        // Replace comma with dot for calculations
        value = value.replace(/,/g, '.');
        
        // Keep only the last dot
        const dots = value.split('.').length - 1;
        if (dots > 1) {
          const parts = value.split('.');
          value = parts[0] + '.' + parts.slice(1).join('');
        }

        // Update display value without formatting while editing
        setDisplayValue(value);
        
        // Pass the numeric value to onChange
        const numericValue = parseFloat(value) || 0;
        onChange?.({ 
          ...e, 
          target: { ...e.target, value: numericValue.toString() } 
        });
      } else if (type === 'number') {
        const value = e.target.value;
        if (value === '' || !isNaN(Number(value))) {
          onChange?.(e);
        }
      } else {
        onChange?.(e);
      }
    };

    // Handle focus to show unformatted value
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        setIsEditing(true);
        const numValue = typeof value === 'number' ? value.toString() : '0';
        setDisplayValue(numValue.replace('.', ','));
      }
      props.onFocus?.(e);
    };

    // Handle blur to reformat value
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        setIsEditing(false);
        if (typeof value === 'number') {
          setDisplayValue(formatNumber(value));
        }
      }
      props.onBlur?.(e);
    };

    const inputValue = isCurrency 
      ? displayValue
      : type === 'number' && value === 0 && !props.min ? '' : value;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {isCurrency && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
          )}
          <input
            className={mergeClasses(
              'block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500',
              'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              isCurrency && 'pl-7 text-right',
              className
            )}
            ref={ref}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            type={isCurrency ? 'text' : type}
            inputMode={isCurrency ? 'decimal' : undefined}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
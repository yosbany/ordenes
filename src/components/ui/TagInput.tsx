import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { mergeClasses } from '@/lib/utils';

interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  suggestions?: string[];
  error?: string;
}

export function TagInput({
  label,
  value,
  onChange,
  onRemove,
  suggestions = [],
  className,
  error,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase());
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onChange(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className={mergeClasses(
          'flex items-center min-h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5',
          'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
          error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
          className
        )}
      >
        {value ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800 mr-2">
            {value}
            <button
              type="button"
              onClick={onRemove}
              className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500 text-sm"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            {...props}
          />
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {showSuggestions && !value && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions
            .filter(suggestion => suggestion.includes(inputValue.toUpperCase()))
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { mergeClasses } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className={mergeClasses("relative", className)} ref={containerRef}>
      <div
        className={mergeClasses(
          "flex items-center border rounded-md bg-white",
          isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300",
          "cursor-pointer"
        )}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {isOpen ? (
          <div className="flex-1 flex items-center px-3">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              ref={inputRef}
              type="text"
              className="w-full py-2 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="flex-1 p-2 px-3">
            {selectedOption ? selectedOption.label : placeholder}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={mergeClasses(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100",
                  option.value === value && "bg-blue-50"
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
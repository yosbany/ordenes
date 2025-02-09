import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Search, X } from 'lucide-react';
import { Provider } from '@/types';
import { mergeClasses } from '@/lib/utils';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string;
  onChange: (providerId: string) => void;
}

export function ProviderSelector({
  providers,
  selectedProviderId,
  onChange
}: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { products } = useGlobalProducts();

  // Filter providers to only those with products
  const providersWithProducts = providers.filter(provider =>
    products.some(product => product.providerId === provider.id)
  );

  const selectedProvider = providersWithProducts.find(p => p.id === selectedProviderId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProviders = providersWithProducts.filter(provider => 
    provider.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (providerId: string) => {
    onChange(providerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Label */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Proveedor
        </label>
      </div>

      {/* Main Selector */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
        className={mergeClasses(
          "relative w-full rounded-lg border bg-white px-4 py-3 h-[48px] cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          selectedProviderId 
            ? "border-blue-200 hover:border-blue-300" 
            : "border-gray-200 hover:border-gray-300",
          "transition-all duration-200 flex items-center"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Building2 className={`
            w-5 h-5 flex-shrink-0
            ${selectedProviderId ? 'text-blue-500' : 'text-gray-400'}
          `} />
          
          <div className="flex-1 min-w-0">
            {selectedProvider ? (
              <div>
                <div className="font-medium text-gray-900 truncate">
                  {selectedProvider.commercialName}
                </div>
                {selectedProvider.legalName && 
                 selectedProvider.legalName !== selectedProvider.commercialName && (
                  <div className="text-sm text-gray-500 truncate">
                    {selectedProvider.legalName}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">
                Seleccionar proveedor...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedProviderId && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClear(e as any);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <ChevronDown className={`
              w-5 h-5 transition-transform duration-200
              ${selectedProviderId ? 'text-blue-500' : 'text-gray-400'}
              ${isOpen ? 'rotate-180' : ''}
            `} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-200">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proveedor..."
                className={`
                  w-full rounded-md border border-gray-200 pl-9 pr-4 py-2 text-sm
                  placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                `}
              />
            </div>
          </div>

          {/* Provider List */}
          <div className="max-h-60 overflow-auto">
            {filteredProviders.length > 0 ? (
              <div className="py-1">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(provider.id!)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelect(provider.id!);
                      }
                    }}
                    className={mergeClasses(
                      "px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors",
                      provider.id === selectedProviderId && "bg-blue-50"
                    )}
                  >
                    <div className="font-medium text-gray-900">
                      {provider.commercialName}
                    </div>
                    {provider.legalName && 
                     provider.legalName !== provider.commercialName && (
                      <div className="text-sm text-gray-500">
                        {provider.legalName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No se encontraron proveedores
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
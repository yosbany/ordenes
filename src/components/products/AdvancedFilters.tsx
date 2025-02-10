import React, { useState, useEffect } from 'react';
import { Filter, X, Search, Tag, DollarSign, Package, ArrowUpDown, Power } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';

interface AdvancedFiltersProps {
  onFilter: (products: Product[]) => void;
  onClear: () => void;
  products: Product[];
  onClose: () => void;
  initialFilters: Filters;
  onUpdateFilters: (filters: Filters) => void;
}

type MarginFilter = 'all' | 'red' | 'orange' | 'green';
type PriceFilter = 'all' | 'no-purchase' | 'no-sale';
type CodesFilter = 'all' | 'no-sku' | 'no-code';
type SortBy = 'updated' | 'margin' | 'name' | 'price';
type EnabledFilter = 'all' | 'enabled' | 'disabled';

interface Filters {
  terms: string;
  margin: MarginFilter;
  price: PriceFilter;
  codes: CodesFilter;
  isProduction: boolean;
  forSale: boolean;
  enabled: EnabledFilter;
  sortBy: SortBy;
  sortDirection: 'asc' | 'desc';
}

const FILTER_STORAGE_KEY = 'product-filters';

export function AdvancedFilters({ 
  onFilter, 
  onClear, 
  products, 
  onClose,
  initialFilters,
  onUpdateFilters
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<Filters>(() => {
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return initialFilters;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const calculateMargin = (product: Product): number | null => {
    if (!product.forSale || !product.salePrice || !product.saleCostPerUnit) return null;
    return ((product.salePrice - product.saleCostPerUnit) / product.salePrice) * 100;
  };

  const getProductMargin = (product: Product): MarginFilter => {
    const margin = calculateMargin(product);
    if (margin === null) return 'all';
    if (margin < 0) return 'red';
    if (margin >= 0 && margin <= 5) return 'orange';
    return 'green';
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.terms) count++;
    if (filters.margin !== 'all') count++;
    if (filters.price !== 'all') count++;
    if (filters.codes !== 'all') count++;
    if (filters.isProduction) count++;
    if (filters.forSale) count++;
    if (filters.enabled !== 'all') count++;
    if (filters.sortBy !== 'updated' || filters.sortDirection !== 'asc') count++;
    return count;
  };

  const applyFilters = async () => {
    setIsProcessing(true);
    try {
      let filtered = [...products];

      // Apply text search filter
      if (filters.terms) {
        const searchLower = filters.terms.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.supplierCode?.toLowerCase().includes(searchLower) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply margin filter
      if (filters.margin !== 'all') {
        filtered = filtered.filter(p => {
          const margin = calculateMargin(p);
          
          switch (filters.margin) {
            case 'red':
              return margin !== null && margin < 0;
            case 'orange':
              return margin !== null && margin >= 0 && margin <= 5;
            case 'green':
              return margin !== null && margin > 5;
            default:
              return true;
          }
        });
      }

      // Apply price filter
      if (filters.price === 'no-purchase') {
        filtered = filtered.filter(p => !p.price || p.price === 0 || p.price === null);
      } else if (filters.price === 'no-sale') {
        filtered = filtered.filter(p => p.forSale && (!p.salePrice || p.salePrice <= 0));
      }

      // Apply type filters
      if (filters.isProduction) {
        filtered = filtered.filter(p => p.isProduction);
      }
      if (filters.forSale) {
        filtered = filtered.filter(p => p.forSale);
      }

      // Apply enabled state filter
      if (filters.enabled !== 'all') {
        filtered = filtered.filter(p => 
          filters.enabled === 'enabled' 
            ? p.enabled !== false 
            : p.enabled === false
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const direction = filters.sortDirection === 'asc' ? 1 : -1;
        
        switch (filters.sortBy) {
          case 'updated':
            return ((a.lastUpdated || 0) - (b.lastUpdated || 0)) * direction;
          case 'margin': {
            const marginA = calculateMargin(a) ?? -Infinity;
            const marginB = calculateMargin(b) ?? -Infinity;
            return (marginA - marginB) * direction;
          }
          case 'name':
            return a.name.localeCompare(b.name) * direction;
          case 'price':
            return ((a.price || 0) - (b.price || 0)) * direction;
          default:
            return 0;
        }
      });

      onUpdateFilters(filters);
      onFilter(filtered);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFilters = () => {
    const defaultFilters = {
      terms: '',
      margin: 'all' as MarginFilter,
      price: 'all' as PriceFilter,
      codes: 'all' as CodesFilter,
      isProduction: false,
      forSale: false,
      enabled: 'all' as EnabledFilter,
      sortBy: 'updated' as SortBy,
      sortDirection: 'asc' as 'asc' | 'desc'
    };
    setFilters(defaultFilters);
    localStorage.removeItem(FILTER_STORAGE_KEY);
    onUpdateFilters(defaultFilters);
    onClear();
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <div className="p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Buscar por nombre, SKU, código o etiquetas..."
          value={filters.terms}
          onChange={(e) => setFilters(prev => ({ ...prev, terms: e.target.value }))}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {/* Margin Filter */}
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'all', label: 'Todos', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
            { value: 'red', label: 'Pérdida (<0%)', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
            { value: 'orange', label: 'Riesgo (0-5%)', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
            { value: 'green', label: 'Ganancia (>5%)', color: 'bg-green-100 hover:bg-green-200 text-green-700' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilters(prev => ({ ...prev, margin: option.value as MarginFilter }))}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filters.margin === option.value ? option.color : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Price Filter */}
        <button
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            price: prev.price === 'no-purchase' ? 'all' : 'no-purchase'
          }))}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5
            ${filters.price === 'no-purchase'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <DollarSign className="w-4 h-4" />
          Sin Precio Compra
        </button>

        {/* Type Filters */}
        <button
          onClick={() => setFilters(prev => ({ ...prev, isProduction: !prev.isProduction }))}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5
            ${filters.isProduction
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Package className="w-4 h-4" />
          Producción
        </button>

        <button
          onClick={() => setFilters(prev => ({ ...prev, forSale: !prev.forSale }))}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5
            ${filters.forSale
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Tag className="w-4 h-4" />
          Venta
        </button>

        {/* Enabled State Filter */}
        <button
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            enabled: prev.enabled === 'all' 
              ? 'enabled' 
              : prev.enabled === 'enabled' 
                ? 'disabled' 
                : 'all'
          }))}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5
            ${filters.enabled !== 'all'
              ? filters.enabled === 'enabled'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Power className="w-4 h-4" />
          {filters.enabled === 'all' 
            ? 'Estado' 
            : filters.enabled === 'enabled' 
              ? 'Habilitados' 
              : 'Deshabilitados'
          }
        </button>

        {/* Sort Button */}
        <button
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' 
          }))}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5
            ${filters.sortBy !== 'updated' || filters.sortDirection !== 'asc'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <ArrowUpDown className="w-4 h-4" />
          {filters.sortBy === 'updated' ? 'Fecha' : 
           filters.sortBy === 'margin' ? 'Margen' :
           filters.sortBy === 'name' ? 'Nombre' : 'Precio'}
          {filters.sortDirection === 'asc' ? ' ↑' : ' ↓'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm h-8"
          >
            Limpiar
          </Button>
        )}
        <Button
          onClick={applyFilters}
          isLoading={isProcessing}
          disabled={isProcessing}
          size="sm"
          className="h-8"
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}
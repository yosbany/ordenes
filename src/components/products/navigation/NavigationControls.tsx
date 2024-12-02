import React, { useState } from 'react';
import { Calendar, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NavigationControlsProps {
  products: Product[];
  currentProduct: Product | null;
  onProductChange: (product: Product) => void;
}

export function NavigationControls({
  products,
  currentProduct,
  onProductChange,
}: NavigationControlsProps) {
  const [date, setDate] = useState(new Date());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    const sortedProducts = [...products].sort((a, b) => {
      const comparison = a.order - b.order;
      return newOrder === 'asc' ? comparison : -comparison;
    });

    if (currentProduct) {
      const firstProduct = sortedProducts[0];
      onProductChange(firstProduct);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="date"
            value={format(date, 'yyyy-MM-dd')}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="text-sm text-gray-600">
          {format(date, "EEEE, d 'de' MMMM", { locale: es })}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSort}
        className="flex items-center space-x-2"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>Ordenar {sortOrder === 'asc' ? 'descendente' : 'ascendente'}</span>
      </Button>
    </div>
  );
}
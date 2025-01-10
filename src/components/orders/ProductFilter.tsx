import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ProductFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductFilter({ value, onChange }: ProductFilterProps) {
  return (
    <div className="relative mb-6">
      <Input
        placeholder="Filtrar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}
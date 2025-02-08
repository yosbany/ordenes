import React, { useState } from 'react';
import { Package, X } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductForm } from './ProductForm';

interface FullscreenProductFormProps {
  providerId: string;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FullscreenProductForm({
  providerId,
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: FullscreenProductFormProps) {
  const [isDirty, setIsDirty] = useState(false);

  const handleClose = () => {
    if (isDirty) {
      if (confirm('¿Está seguro que desea descartar los cambios?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Colored Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <h2 className="text-lg font-semibold">
              {initialData ? 'Editar' : 'Nuevo'} Producto
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2 hover:bg-white/10 text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProductForm
            providerId={providerId}
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            onDirtyChange={setIsDirty}
          />
        </div>
      </div>
    </div>
  );
}
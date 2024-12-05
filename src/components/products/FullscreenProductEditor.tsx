import React from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductForm } from './ProductForm';

interface FullscreenProductEditorProps {
  providerId: string;
  product: Product;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FullscreenProductEditor({
  providerId,
  product,
  onSubmit,
  onCancel,
  isSubmitting
}: FullscreenProductEditorProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-3 h-16">
          <h2 className="text-lg font-semibold">Editar Producto</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto max-w-2xl px-3 py-4">
            <ProductForm
              providerId={providerId}
              initialData={product}
              onSubmit={onSubmit}
              onCancel={onCancel}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { X } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { Product } from '@/types';

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
  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    try {
      await onSubmit({
        ...data,
        providerId: data.providerId || providerId
      });
    } catch (error) {
      console.error('Error in FullscreenProductForm submit:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-3 h-14">
          <h2 className="text-lg font-semibold">
            {initialData ? 'Editar' : 'Nuevo'} Producto
          </h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
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
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
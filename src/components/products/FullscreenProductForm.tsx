import React from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types';
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
  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    try {
      // Si hay datos iniciales, preservar ID y orden
      if (initialData) {
        await onSubmit({
          ...data,
          id: initialData.id,
          order: initialData.order,
          providerId: initialData.providerId
        });
      } else {
        // Para nuevo producto
        await onSubmit({
          ...data,
          providerId
        });
      }
    } catch (error) {
      console.error('Error en FullscreenProductForm submit:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-3 h-16">
          <h2 className="text-lg font-semibold">
            {initialData ? `Editar ${initialData.name}` : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
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
  );
}
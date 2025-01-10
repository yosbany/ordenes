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
  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    try {
      // Preserve the original product ID, providerId and order
      const updatedData = {
        ...data,
        id: product.id, // Keep original ID
        providerId: product.providerId, // Keep original providerId
        order: product.order // Keep original order
      };
      
      await onSubmit(updatedData);
    } catch (error) {
      console.error('Error in FullscreenProductEditor submit:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-3 h-16">
          <h2 className="text-lg font-semibold">
            Editar {product.name}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
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
            initialData={product}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
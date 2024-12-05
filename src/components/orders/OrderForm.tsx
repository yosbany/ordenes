import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useProducts } from '@/hooks/useProducts';
import { Order, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ProductSelector } from './ProductSelector';
import { OrderSummary } from './OrderSummary';

interface OrderFormProps {
  providerId: string;
  initialData?: Order;
  onSubmit: (data: Omit<Order, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrderForm({
  providerId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: OrderFormProps) {
  const { products, loading, updateProduct } = useProducts(providerId);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(() => {
    const initial = new Map();
    if (initialData?.items) {
      initialData.items.forEach((item) => {
        initial.set(item.productId, item.quantity);
      });
    }
    return initial;
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleProductSelect = (productId: string, quantity: number) => {
    const newSelected = new Map(selectedProducts);
    if (quantity > 0) {
      newSelected.set(productId, quantity);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const calculateTotal = () => {
    if (!products) return 0;
    return Array.from(selectedProducts.entries()).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleConfirm = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const items = Array.from(selectedProducts.entries()).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Producto no encontrado');
      return {
        productId,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      };
    });

    const orderData: Omit<Order, 'id'> = {
      providerId,
      date: new Date().toISOString(),
      status: 'pending',
      items,
      total: calculateTotal(),
    };

    await onSubmit(orderData);
    setIsConfirmDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay productos disponibles</p>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          setIsConfirmDialogOpen(true);
        }} 
        className="relative h-[calc(100vh-16rem)]"
      >
        <div className="h-full overflow-hidden">
          <ProductSelector
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onProductUpdate={updateProduct}
          />
        </div>

        {selectedProducts.size > 0 && (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                Total: {formatPrice(total)}
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  {initialData ? 'Actualizar' : 'Crear'} Orden
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>

      <Dialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title={`Confirmar ${initialData ? 'actualización de' : 'nueva'} orden`}
      >
        <div className="space-y-4">
          <OrderSummary
            products={products}
            selectedProducts={selectedProducts}
            total={total}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
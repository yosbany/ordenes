import React, { useState } from 'react';
import { X, ArrowLeft, Calendar, Building2, FileText, Package, AlertTriangle } from 'lucide-react';
import { Order, Product, Provider } from '@/types';
import { Button } from '@/components/ui/Button';
import { OrderSummary } from './OrderSummary';
import { OrderActions } from './OrderActions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { fromTimestamp } from '@/lib/dateUtils';
import { Dialog } from '@/components/ui/Dialog';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'react-hot-toast';

interface OrderDetailsProps {
  order: Order;
  orderNumber: number;
  products: Product[];
  provider: Provider;
  onClose: () => void;
  onEdit?: () => void;
}

export function OrderDetails({ 
  order, 
  orderNumber, 
  products, 
  provider, 
  onClose,
  onEdit 
}: OrderDetailsProps) {
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
  const { updateOrder } = useOrders(provider.id);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const orderDate = format(fromTimestamp(order.date), "d 'de' MMMM, yyyy HH:mm", { locale: es });
  const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleReopen = async () => {
    setIsProcessing(true);
    try {
      await updateOrder(order.id!, {
        ...order,
        status: 'pending'
      });
      toast.success('Orden reabierta exitosamente');
      onEdit?.();
    } catch (error) {
      console.error('Error reopening order:', error);
      toast.error('Error al reabrir la orden');
    } finally {
      setIsProcessing(false);
      setIsReopenDialogOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b print:hidden sticky top-0 z-10">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  Orden #{orderNumber}
                </h2>
                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${order.status === 'completed' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                  }
                `}>
                  {order.status === 'completed' ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {orderDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-3 py-4">
          {/* Print Header */}
          <div className="hidden print:block mb-8">
            <h1 className="text-2xl font-bold text-center mb-2">Orden de Compra</h1>
            <div className="text-center text-gray-600 mb-4">#{orderNumber}</div>
          </div>

          <div className="grid gap-4">
            {/* Order Info */}
            <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
              {/* Date Card */}
              <div className="bg-white p-4 rounded-lg border shadow-sm print:border-gray-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Fecha</h3>
                </div>
                <p className="text-gray-600">{orderDate}</p>
              </div>

              {/* Provider Card */}
              <div className="bg-white p-4 rounded-lg border shadow-sm print:border-gray-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Proveedor</h3>
                </div>
                <p className="font-medium">{provider.commercialName}</p>
                {provider.legalName && provider.legalName !== provider.commercialName && (
                  <p className="text-sm text-gray-500">{provider.legalName}</p>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-white p-4 rounded-lg border shadow-sm print:border-gray-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-medium">Resumen</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    {totalProducts} productos
                  </p>
                  <p className="font-medium text-lg text-blue-600">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white p-4 rounded-lg border shadow-sm print:border-gray-300">
              <div className="flex items-center gap-3 mb-4 print:mb-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-medium">Detalles del Pedido</h3>
              </div>
              <OrderSummary
                order={order}
                products={products}
                provider={provider}
                preview={false}
              />
            </div>

            {/* Actions */}
            {order.status === 'completed' ? (
              <div className="print:hidden">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <OrderActions
                    order={order}
                    products={products}
                    provider={provider}
                    onReopen={() => setIsReopenDialogOpen(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="print:hidden bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3 text-amber-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>Esta orden está pendiente de completar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reopen Dialog */}
      <Dialog
        isOpen={isReopenDialogOpen}
        onClose={() => setIsReopenDialogOpen(false)}
        title="Reabrir orden"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea reabrir esta orden para edición?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsReopenDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReopen}
              isLoading={isProcessing}
            >
              Reabrir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
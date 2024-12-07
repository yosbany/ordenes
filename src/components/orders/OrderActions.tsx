import React, { useState } from 'react';
import { Share2, Printer, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Order, Product, Provider } from '@/types';
import { formatWhatsAppReport } from '@/lib/utils/formatting/whatsappReport';
import { generateWhatsAppLink } from '@/lib/utils';
import { generatePrintTemplate } from '@/lib/utils/formatting/printTemplate';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'react-hot-toast';

interface OrderActionsProps {
  order: Order;
  products: Product[];
  provider: Provider;
  onReopen?: () => void;
}

export function OrderActions({ order, products, provider, onReopen }: OrderActionsProps) {
  const { updateOrder, deleteOrder } = useOrders(provider.id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWhatsApp = async () => {
    if (!provider.phone) {
      toast.error('Este proveedor no tiene número de teléfono registrado');
      return;
    }

    setIsProcessing(true);
    try {
      // Mark order as completed if it's pending
      if (order.status === 'pending') {
        await updateOrder(order.id!, {
          ...order,
          status: 'completed'
        });
      }

      const message = formatWhatsAppReport(order, products, provider);
      const whatsappUrl = generateWhatsAppLink(provider.phone, message);
      window.open(whatsappUrl, '_blank');
      
      if (order.status === 'pending') {
        toast.success('Orden completada y enviada por WhatsApp');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error('Error al enviar por WhatsApp');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      // Mark order as completed if it's pending
      if (order.status === 'pending') {
        await updateOrder(order.id!, {
          ...order,
          status: 'completed'
        });
      }

      const template = generatePrintTemplate(order, products);
      
      const printTab = window.open('', '_blank');
      if (!printTab) {
        throw new Error('No se pudo crear la pestaña de impresión');
      }

      printTab.document.write(template);
      printTab.document.close();

      if (order.status === 'pending') {
        toast.success('Orden completada e impresa');
      }
    } catch (error) {
      console.error('Error printing order:', error);
      toast.error('Error al imprimir la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteOrder(order.id!);
      toast.success('Orden eliminada exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {provider.phone && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleWhatsApp}
            disabled={isProcessing}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 w-11 h-11 p-0"
            title="Enviar por WhatsApp"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        )}
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrint}
          disabled={isProcessing}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 w-11 h-11 p-0"
          title="Imprimir"
        >
          <Printer className="w-5 h-5" />
        </Button>

        {order.status === 'completed' && onReopen && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReopen}
            disabled={isProcessing}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-11 h-11 p-0"
            title="Reabrir orden"
          >
            <Edit className="w-5 h-5" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isProcessing}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-11 h-11 p-0"
          title="Eliminar orden"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Eliminar orden"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar esta orden?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isProcessing}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
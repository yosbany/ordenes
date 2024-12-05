import React, { useState } from 'react';
import { Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Order, Product, Provider } from '@/types';
import { formatOrderReport } from '@/lib/utils/formatting/orderReport';
import { formatWhatsAppReport } from '@/lib/utils/formatting/whatsappReport';
import { generateWhatsAppLink } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { OrderSummary } from './OrderSummary';

interface OrderActionsProps {
  order: Order;
  products: Product[];
  provider: Provider | undefined;
}

export function OrderActions({ order, products, provider }: OrderActionsProps) {
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateOrder } = useOrders(provider?.id);

  // If no provider is available, don't render anything
  if (!provider) {
    return null;
  }

  const handleWhatsAppConfirm = async () => {
    if (!provider.phone) {
      toast.error('Este proveedor no tiene número de teléfono registrado');
      return;
    }

    setIsProcessing(true);
    try {
      await updateOrder(order.id!, { 
        ...order,
        status: 'completed' 
      });
      const message = formatWhatsAppReport(order, products, provider);
      const whatsappUrl = generateWhatsAppLink(provider.phone, message);
      window.open(whatsappUrl, '_blank');
      setIsWhatsAppDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado de la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintConfirm = async () => {
    setIsProcessing(true);
    try {
      await updateOrder(order.id!, {
        ...order,
        status: 'completed'
      });
      
      const content = formatOrderReport(order, products, provider);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo crear la ventana de impresión');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Orden - ${provider.commercialName}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              @media print {
                body {
                  width: 80mm;
                  margin: 0;
                  padding: 8px;
                  font-family: monospace;
                  font-size: 12px;
                  line-height: 1.2;
                }
                pre {
                  margin: 0;
                  white-space: pre-wrap;
                  font-family: inherit;
                  font-size: inherit;
                }
              }
              body {
                font-family: monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 8px;
                width: 80mm;
              }
              pre {
                margin: 0;
                white-space: pre-wrap;
                font-family: inherit;
                font-size: inherit;
              }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      setIsPrintDialogOpen(false);
    } catch (error) {
      console.error('Error printing order:', error);
      toast.error('Error al imprimir la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        {provider.phone && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsWhatsAppDialogOpen(true)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto"
            disabled={isProcessing}
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPrintDialogOpen(true)}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <Dialog
        isOpen={isWhatsAppDialogOpen}
        onClose={() => setIsWhatsAppDialogOpen(false)}
        title="Confirmar envío por WhatsApp"
      >
        <div className="space-y-4">
          <p>¿Desea enviar el siguiente pedido por WhatsApp?</p>
          <OrderSummary
            order={order}
            products={products}
            provider={provider}
            preview={true}
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsWhatsAppDialogOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleWhatsAppConfirm}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              isLoading={isProcessing}
            >
              Enviar
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        title="Confirmar impresión"
      >
        <div className="space-y-4">
          <p>¿Desea imprimir el siguiente pedido?</p>
          <OrderSummary
            order={order}
            products={products}
            provider={provider}
            preview={false}
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPrintDialogOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePrintConfirm}
              isLoading={isProcessing}
              className="w-full sm:w-auto"
            >
              Imprimir
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
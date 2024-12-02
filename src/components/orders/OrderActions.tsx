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
  provider: Provider;
}

export function OrderActions({ order, products, provider }: OrderActionsProps) {
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateOrder } = useOrders(provider.id);

  const formattedPrintMessage = formatOrderReport(order, products, provider);
  const formattedWhatsAppMessage = formatWhatsAppReport(order, products, provider);

  const handleWhatsAppConfirm = async () => {
    if (!provider.phone) {
      alert('Este proveedor no tiene número de teléfono registrado');
      return;
    }

    setIsProcessing(true);
    try {
      await updateOrder(order.id!, { 
        ...order,
        status: 'completed' 
      });
      const whatsappUrl = generateWhatsAppLink(provider.phone, formattedWhatsAppMessage);
      window.open(whatsappUrl, '_blank');
      setIsWhatsAppDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado de la orden');
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
      
      const printWindow = window.open('', '_blank', 'width=302,height=600');
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
                }
              }
              body {
                font-family: monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 8px;
                width: 80mm;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            ${formattedPrintMessage}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            setIsPrintDialogOpen(false);
          };
        } catch (error) {
          console.error('Error during print:', error);
          printWindow.close();
          setIsPrintDialogOpen(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error printing order:', error);
      alert('Error al imprimir la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        {provider.phone && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsWhatsAppDialogOpen(true)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
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
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsWhatsAppDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleWhatsAppConfirm}
              className="bg-green-600 hover:bg-green-700"
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
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPrintDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePrintConfirm}
              isLoading={isProcessing}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
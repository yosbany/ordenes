import { Order, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTimestamp } from '@/lib/dateUtils';
import { thermalPrintStyles } from '../printing/styles';
import { printScripts } from '../printing/scripts';

export function generatePrintTemplate(order: Order, products: Product[]): string {
  const date = format(fromTimestamp(order.date), "dd/MM/yyyy HH:mm", { locale: es });
  
  // Sort items by product order
  const sortedItems = order.items
    .sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      if (!productA || !productB) return 0;
      return productA.order - productB.order;
    });

  // Generate products HTML
  const productsHtml = sortedItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return '';
      return `
        <tr>
          <td class="quantity">${item.quantity} ${product.purchasePackaging}</td>
          <td class="name">${product.name}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orden de Compra</title>
        <style>${thermalPrintStyles}</style>
      </head>
      <body>
        <div class="content">
          <div class="header">
            <div>Pedido Fecha: ${date}</div>
            <div>${BUSINESS_INFO.name}</div>
            <div>${BUSINESS_INFO.owner}</div>
          </div>

          <table>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>
        </div>

        <div class="controls">
          <button id="print-button" class="print-button">
            Imprimir
          </button>
        </div>

        <script>${printScripts}</script>
      </body>
    </html>
  `;
}
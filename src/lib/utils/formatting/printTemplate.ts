import { Order, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTimestamp } from '@/lib/dateUtils';

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
        <title>Orden de Compra</title>
        <style>
          /* Reset */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* Base styles - visible in both screen and print */
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            width: 80mm;
            padding: 4mm;
            background: white;
          }

          .header {
            text-align: center;
            margin-bottom: 4mm;
          }

          .header div {
            margin-bottom: 1mm;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 1mm;
          }

          td.quantity {
            white-space: nowrap;
            padding-right: 2mm;
            width: 1%;
          }

          td.name {
            word-break: break-word;
          }

          /* Print-specific styles */
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }

            html, body {
              width: 80mm;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Hide print dialog */
            #print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
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

        <button id="print-button" onclick="window.print()" style="
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">
          Imprimir
        </button>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Auto-print after a short delay to ensure content is rendered
            setTimeout(function() {
              try {
                window.print();
                // Close window after printing (or if print is cancelled)
                setTimeout(function() {
                  window.close();
                }, 1000);
              } catch (e) {
                console.error('Print error:', e);
                // Show error message in print window
                document.body.innerHTML += '<p style="color: red; margin-top: 20px;">Error al imprimir. Por favor, intente nuevamente.</p>';
              }
            }, 500);
          });
        </script>
      </body>
    </html>
  `;
}
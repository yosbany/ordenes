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
            font-size: 14px;
            line-height: 1.4;
            width: 210mm; /* A4 width */
            max-width: 100%;
            margin: 0 auto;
            padding: 20mm;
            background: white;
          }

          .header {
            text-align: center;
            margin-bottom: 10mm;
            padding-bottom: 5mm;
            border-bottom: 1px solid #e5e7eb;
          }

          .header div {
            margin-bottom: 2mm;
          }

          .header .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4mm;
          }

          .header .date {
            font-size: 16px;
            color: #4b5563;
          }

          .header .business {
            font-size: 18px;
            margin-top: 4mm;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5mm;
          }

          tr {
            border-bottom: 1px solid #e5e7eb;
          }

          tr:last-child {
            border-bottom: none;
          }

          td {
            padding: 3mm 2mm;
          }

          td.quantity {
            white-space: nowrap;
            padding-right: 5mm;
            width: 20%;
            font-weight: bold;
          }

          td.name {
            word-break: break-word;
          }

          .error-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fee2e2;
            color: #991b1b;
            padding: 12px 24px;
            border-radius: 6px;
            border: 1px solid #fecaca;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
            max-width: 90%;
          }

          #print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.2s;
          }

          #print-button:hover {
            background: #1d4ed8;
          }

          #print-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }

          /* Print-specific styles */
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }

            body {
              width: 100%;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            #print-button,
            .error-message {
              display: none;
            }

            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Orden de Compra</div>
          <div class="date">Fecha: ${date}</div>
          <div class="business">
            <div>${BUSINESS_INFO.name}</div>
            <div>${BUSINESS_INFO.owner}</div>
          </div>
        </div>

        <table>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <button id="print-button" onclick="handlePrint()">
          Imprimir
        </button>

        <script>
          let isPrinting = false;
          let retryCount = 0;
          const MAX_RETRIES = 3;

          function showError(message) {
            // Remove any existing error messages
            const existingError = document.querySelector('.error-message');
            if (existingError) {
              existingError.remove();
            }

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);

            // Enable print button
            const printButton = document.getElementById('print-button');
            if (printButton) {
              printButton.disabled = false;
            }
          }

          function handlePrint() {
            if (isPrinting) return;

            try {
              const printButton = document.getElementById('print-button');
              printButton.disabled = true;
              isPrinting = true;

              window.print();

              // Handle print completion
              window.onafterprint = () => {
                isPrinting = false;
                setTimeout(() => {
                  window.close();
                }, 100);
              };

              // Fallback if onafterprint is not supported
              setTimeout(() => {
                if (!window.closed && isPrinting) {
                  isPrinting = false;
                  printButton.disabled = false;
                  
                  if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    showError('La impresión está tardando más de lo esperado. Intente nuevamente.');
                  } else {
                    showError('No se pudo completar la impresión. Por favor, cierre esta ventana e intente nuevamente.');
                  }
                }
              }, 2000);

            } catch (error) {
              console.error('Print error:', error);
              isPrinting = false;
              showError('Error al imprimir. Por favor, intente nuevamente.');
            }
          }

          // Auto-print on load
          window.onload = () => {
            try {
              // Short delay to ensure content is rendered
              setTimeout(handlePrint, 500);
            } catch (error) {
              console.error('Print error:', error);
              showError('Error al iniciar la impresión. Por favor, use el botón Imprimir.');
            }
          };

          // Global error handler
          window.onerror = (message, source, lineno, colno, error) => {
            console.error('Print error:', { message, source, lineno, colno, error });
            showError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
            return false;
          };
        </script>
      </body>
    </html>
  `;
}
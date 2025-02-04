import { Recipe, Product } from '@/types';
import { BUSINESS_INFO } from '@/config/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { thermalPrintStyles } from './styles';
import { printScripts } from './scripts';

export function generateRecipePrintTemplate(recipe: Recipe, products: Product[]): string {
  const date = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
  
  // Sort materials by product order
  const sortedMaterials = recipe.materials
    .sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      if (!productA || !productB) return 0;
      return productA.order - productB.order;
    });

  // Generate materials HTML
  const materialsHtml = sortedMaterials
    .map(material => {
      const product = products.find(p => p.id === material.productId);
      if (!product) return '';
      return `
        <tr>
          <td class="quantity">${material.quantity} ${material.unit}</td>
          <td class="material">${product.name}</td>
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
        <title>Receta: ${recipe.name}</title>
        <style>
          ${thermalPrintStyles}
          
          /* Recipe specific styles */
          .recipe-header {
            text-align: center;
            margin: 3mm 0;
            padding-bottom: 2mm;
            border-bottom: 1px dashed #000;
          }
          
          .recipe-header h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 2mm 0;
          }
          
          .recipe-header p {
            font-size: 12px;
            margin: 0;
          }
          
          table thead tr th {
            font-size: 12px;
            font-weight: bold;
            padding: 1mm 0;
          }
          
          table thead tr th.quantity-header {
            text-align: left;
            width: 30%;
          }
          
          table thead tr th.material-header {
            text-align: right;
            width: 70%;
          }
          
          td.quantity {
            font-weight: bold;
            width: 30%;
            text-align: left;
            white-space: nowrap;
          }
          
          td.material {
            width: 70%;
            text-align: right;
            padding-left: 2mm;
          }
          
          .notes {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 1px dashed #000;
          }
          
          .notes h2 {
            font-size: 12px;
            font-weight: bold;
            margin: 0 0 1mm 0;
          }
          
          .notes p {
            font-size: 12px;
            margin: 0;
            white-space: pre-line;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="header">
            <div>${BUSINESS_INFO.name}</div>
            <div>${BUSINESS_INFO.owner}</div>
            <div>Fecha: ${date}</div>
          </div>

          <div class="recipe-header">
            <h1>${recipe.name}</h1>
            <p>Rendimiento: ${recipe.yield} ${recipe.yieldUnit}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th class="quantity-header">Cantidad</th>
                <th class="material-header">Material</th>
              </tr>
            </thead>
            <tbody>
              ${materialsHtml}
            </tbody>
          </table>

          ${recipe.notes ? `
            <div class="notes">
              <h2>Notas:</h2>
              <p>${recipe.notes.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
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
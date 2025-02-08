import { Product, Provider } from '@/types';
import { Recipe } from '@/types/recipe';
import { updateProduct } from '@/lib/services/products';
import { updateRecipe } from '@/lib/services/recipes';
import { parseCSVContent } from './csvParser';

interface CsvRow {
  fecha?: string;
  rut?: string;
  codigo: string;
  nombre?: string;
  precio?: string;
  contado?: string;
}

interface ImportResult {
  updated: number;
  errors: string[];
  details: {
    updatedProducts: Array<{
      name: string;
      oldPrice: number;
      newPrice: number;
      csvName: string;
      type: 'product' | 'recipe';
    }>;
    notFoundProducts: Array<{
      code: string;
      providerRut?: string;
      csvName: string;
    }>;
    invalidRows: Array<{
      row: number;
      reason: string;
    }>;
  };
}

function normalizeHeaders(headers: string[]): string[] {
  const headerMap: Record<string, string> = {
    'código': 'codigo',
    'codigo': 'codigo',
    'artículo': 'nombre',
    'articulo': 'nombre',
    'contado': 'contado',
    'fecha': 'fecha',
    'rut': 'rut',
    'nombre': 'nombre',
    'precio': 'precio'
  };

  return headers.map(header => {
    const normalizedHeader = header
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    return headerMap[normalizedHeader] || normalizedHeader;
  });
}

function parsePrice(priceStr: string): number {
  try {
    let clean = priceStr.replace(/[^\d.,]/g, '');
    
    if (clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(',', '.');
      }
    }

    const price = parseFloat(clean);
    if (isNaN(price)) {
      throw new Error(`Valor no numérico: ${priceStr}`);
    }
    
    return Number(price.toFixed(2));
  } catch (error) {
    throw new Error(`Error al procesar precio "${priceStr}": ${error instanceof Error ? error.message : 'formato inválido'}`);
  }
}

export async function processCsvImport(
  content: string,
  products: Product[],
  providers: Provider[],
  recipes: Recipe[],
  importType: 'purchase' | 'sale' = 'purchase'
): Promise<ImportResult> {
  const result: ImportResult = {
    updated: 0,
    errors: [],
    details: {
      updatedProducts: [],
      notFoundProducts: [],
      invalidRows: []
    }
  };
  
  try {
    if (!content.trim()) {
      throw new Error('El archivo está vacío');
    }

    const rows = parseCSVContent(content);
    if (rows.length < 2) {
      throw new Error('No se encontraron datos para procesar');
    }

    const headers = normalizeHeaders(rows[0]);
    const requiredHeaders = importType === 'purchase' 
      ? ['fecha', 'rut', 'codigo', 'nombre', 'precio']
      : ['codigo', 'nombre', 'contado'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Faltan las siguientes columnas: ${missingHeaders.join(', ')}`);
    }

    const headerIndexes = requiredHeaders.map(h => headers.indexOf(h));

    for (const [index, values] of rows.slice(1).entries()) {
      try {
        if (values.length < headerIndexes.length) {
          result.details.invalidRows.push({
            row: index + 2,
            reason: 'Número incorrecto de columnas'
          });
          continue;
        }

        const row = importType === 'purchase' ? {
          fecha: values[headerIndexes[0]],
          rut: values[headerIndexes[1]],
          codigo: values[headerIndexes[2]].replace(/[°\[\]]/g, '').trim(),
          nombre: values[headerIndexes[3]],
          precio: values[headerIndexes[4]]
        } : {
          codigo: values[headerIndexes[0]].replace(/[°\[\]]/g, '').trim(),
          nombre: values[headerIndexes[1]],
          contado: values[headerIndexes[2]]
        };

        try {
          const newPrice = parsePrice(importType === 'purchase' ? row.precio! : row.contado!);

          if (importType === 'purchase') {
            // Handle purchase price updates (products only)
            const matchingProducts = products.filter(p => p.sku === row.codigo);
            if (matchingProducts.length === 0) {
              result.details.notFoundProducts.push({
                code: row.codigo,
                providerRut: row.rut,
                csvName: row.nombre || ''
              });
              continue;
            }

            const cleanRut = row.rut!.replace(/\D/g, '');
            const provider = providers.find(p => p.rut?.replace(/\D/g, '') === cleanRut);
            if (!provider) {
              result.details.notFoundProducts.push({
                code: row.codigo,
                providerRut: row.rut,
                csvName: row.nombre || ''
              });
              continue;
            }

            const productsToUpdate = matchingProducts.filter(p => p.providerId === provider.id);
            for (const product of productsToUpdate) {
              if (Math.abs(product.price - newPrice) > 0.01) {
                await updateProduct(product.id!, { price: newPrice });
                result.updated++;
                result.details.updatedProducts.push({
                  name: product.name,
                  oldPrice: product.price,
                  newPrice: newPrice,
                  csvName: row.nombre || row.codigo,
                  type: 'product'
                });
              }
            }
          } else {
            // Handle sale price updates (both products and recipes)
            const matchingItems = [
              ...products.filter(p => p.sku === row.codigo).map(p => ({ type: 'product' as const, item: p })),
              ...recipes.filter(r => r.sku === row.codigo).map(r => ({ type: 'recipe' as const, item: r }))
            ];

            if (matchingItems.length === 0) {
              result.details.notFoundProducts.push({
                code: row.codigo,
                csvName: row.nombre || ''
              });
              continue;
            }

            for (const { type, item } of matchingItems) {
              const currentPrice = type === 'product' 
                ? (item as Product).salePrice || 0
                : (item as Recipe).salePrice || 0;

              if (Math.abs(currentPrice - newPrice) > 0.01) {
                if (type === 'product') {
                  await updateProduct(item.id!, {
                    salePrice: newPrice,
                    forSale: true
                  });
                } else {
                  await updateRecipe(item.id!, {
                    salePrice: newPrice,
                    forSale: true
                  });
                }

                result.updated++;
                result.details.updatedProducts.push({
                  name: item.name,
                  oldPrice: currentPrice,
                  newPrice: newPrice,
                  csvName: row.nombre || row.codigo,
                  type
                });
              }
            }
          }
        } catch (error) {
          result.details.invalidRows.push({
            row: index + 2,
            reason: error instanceof Error ? error.message : 'Error al procesar el precio'
          });
        }
      } catch (error) {
        result.details.invalidRows.push({
          row: index + 2,
          reason: error instanceof Error ? error.message : 'Error al procesar la fila'
        });
      }
    }

    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error procesando el archivo'
    );
  }
}
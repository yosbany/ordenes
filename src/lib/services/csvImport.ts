import { Product, Provider } from '@/types';
import { updateProduct } from '@/lib/services/products';
import { updateRecipe } from '@/lib/services/recipes';
import { parseCSVContent } from './csvParser';
import { Recipe } from '@/types/recipe';

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

// ... existing code for normalizeHeaders and parsePrice remains the same ...

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

        const matchingProducts = products.filter(p => p.sku === row.codigo);
        if (matchingProducts.length === 0) {
          result.details.notFoundProducts.push({
            code: row.codigo,
            providerRut: row.rut,
            csvName: row.nombre || ''
          });
          continue;
        }

        let productsToUpdate = matchingProducts;
        if (importType === 'purchase') {
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

          productsToUpdate = matchingProducts.filter(p => p.providerId === provider.id);
        }

        try {
          const newPrice = parsePrice(importType === 'purchase' ? row.precio! : row.contado!);

          // Update products
          for (const product of productsToUpdate) {
            const currentPrice = importType === 'purchase' ? product.price : (product.salePrice || 0);
            
            if (Math.abs(currentPrice - newPrice) > 0.01) {
              const updates: Partial<Product> = importType === 'purchase' 
                ? { price: newPrice }
                : { salePrice: newPrice, forSale: true };

              await updateProduct(product.id!, updates);
              result.updated++;
              result.details.updatedProducts.push({
                name: product.name,
                oldPrice: currentPrice,
                newPrice: newPrice,
                csvName: row.nombre || row.codigo
              });
            }
          }

          // Update recipes with matching SKU
          if (importType === 'sale') {
            const matchingRecipes = recipes.filter(r => r.sku === row.codigo);
            for (const recipe of matchingRecipes) {
              if (Math.abs((recipe.salePrice || 0) - newPrice) > 0.01) {
                await updateRecipe(recipe.id!, {
                  salePrice: newPrice,
                  forSale: true
                });
                result.updated++;
                result.details.updatedProducts.push({
                  name: recipe.name,
                  oldPrice: recipe.salePrice || 0,
                  newPrice: newPrice,
                  csvName: row.nombre || row.codigo
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
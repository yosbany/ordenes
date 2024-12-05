import { Product, Provider } from '@/types';
import { updateProduct } from '@/lib/services/products';
import { parseCSVContent } from './csvParser';

interface CsvRow {
  fecha: string;
  rut: string;
  codigo: string;
  nombre: string;
  precio: string;
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
      providerRut: string;
      csvName: string;
    }>;
    invalidRows: Array<{
      row: number;
      reason: string;
    }>;
  };
}

function normalizeHeaders(headers: string[]): string[] {
  return headers.map(header => 
    header
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
  );
}

function parseCsvRows(content: string): CsvRow[] {
  const rows = parseCSVContent(content);
  if (rows.length < 2) {
    throw new Error('El archivo está vacío o no tiene el formato correcto');
  }

  // Get headers and validate
  const headers = normalizeHeaders(rows[0]);
  const requiredHeaders = ['fecha', 'rut', 'codigo', 'nombre', 'precio'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Faltan las siguientes columnas: ${missingHeaders.join(', ')}`);
  }

  // Get header indexes
  const headerIndexes = requiredHeaders.map(h => headers.indexOf(h));

  // Parse data rows
  return rows.slice(1).map(values => {
    if (values.length < headerIndexes.length) {
      throw new Error('Número incorrecto de columnas');
    }

    return {
      fecha: values[headerIndexes[0]],
      rut: values[headerIndexes[1]],
      codigo: values[headerIndexes[2]],
      nombre: values[headerIndexes[3]],
      precio: values[headerIndexes[4]]
    };
  });
}

function validateRow(row: CsvRow): string | null {
  // Clean and validate RUT
  const cleanRut = row.rut.replace(/\D/g, '');
  if (!cleanRut) return 'RUT vacío';
  if (!/^\d{12}$/.test(cleanRut)) return 'RUT inválido';

  // Clean and validate code
  const cleanCode = row.codigo.trim();
  if (!cleanCode) return 'Código vacío';

  // Clean and validate price
  const cleanPrice = row.precio
    .replace(/[^\d.,]/g, '') // Remove all non-digit, non-decimal characters
    .replace(/\./g, '') // Remove thousands separator
    .replace(',', '.'); // Replace decimal comma with dot

  const price = parseFloat(cleanPrice);
  if (isNaN(price) || price < 0) return 'Precio inválido';
  
  return null;
}

function parsePrice(priceStr: string): number {
  // Remove currency symbols and spaces
  let clean = priceStr.replace(/[^\d.,]/g, '');
  
  // Handle different number formats:
  // 1.234,56 -> 1234.56
  // 1,234.56 -> 1234.56
  // 1234,56 -> 1234.56
  if (clean.includes(',')) {
    // If there's a dot before the comma, it's thousands (1.234,56)
    if (clean.indexOf('.') < clean.indexOf(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // Otherwise, just replace comma with dot
      clean = clean.replace(',', '.');
    }
  }

  const price = parseFloat(clean);
  if (isNaN(price)) {
    throw new Error(`Precio inválido: ${priceStr}`);
  }
  
  return Number(price.toFixed(2)); // Ensure 2 decimal places
}

export async function processCsvImport(
  content: string,
  products: Product[],
  providers: Provider[]
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
    // Validate content is not empty
    if (!content.trim()) {
      throw new Error('El archivo está vacío');
    }

    const rows = parseCsvRows(content);
    if (rows.length === 0) {
      throw new Error('No se encontraron datos para procesar');
    }

    // Process each row
    for (const [index, row] of rows.entries()) {
      try {
        // Validate row
        const error = validateRow(row);
        if (error) {
          result.details.invalidRows.push({
            row: index + 2,
            reason: error
          });
          continue;
        }

        // Clean RUT
        const cleanRut = row.rut.replace(/\D/g, '');

        // Find provider by RUT
        const provider = providers.find(p => p.rut?.replace(/\D/g, '') === cleanRut);
        if (!provider) {
          result.details.notFoundProducts.push({
            code: row.codigo,
            providerRut: row.rut,
            csvName: row.nombre
          });
          continue;
        }

        // Find product by provider code
        const product = products.find(p => 
          p.providerId === provider.id && 
          p.supplierCode?.toLowerCase() === row.codigo.toLowerCase()
        );

        if (!product) {
          result.details.notFoundProducts.push({
            code: row.codigo,
            providerRut: row.rut,
            csvName: row.nombre
          });
          continue;
        }

        // Parse and validate price
        try {
          const newPrice = parsePrice(row.precio);

          // Update product price if different
          if (Math.abs(product.price - newPrice) > 0.01) {
            await updateProduct(product.id!, { price: newPrice });
            result.updated++;
            result.details.updatedProducts.push({
              name: product.name,
              oldPrice: product.price,
              newPrice: newPrice,
              csvName: row.nombre
            });
          }
        } catch (error) {
          result.details.invalidRows.push({
            row: index + 2,
            reason: error instanceof Error ? error.message : 'Precio inválido'
          });
        }
      } catch (error) {
        result.details.invalidRows.push({
          row: index + 2,
          reason: error instanceof Error ? error.message : 'Error desconocido'
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
import { read, utils } from "xlsx";

export function parseExcelContent(content: string): string[][] {
  try {
    // Check if content is base64
    const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(content);
    
    let workbook;
    if (isBase64) {
      // Convert base64 string to binary string
      const binaryString = Buffer.from(content, 'base64').toString('binary');
      workbook = read(binaryString, { type: 'binary' });
    } else {
      // Try to read directly
      workbook = read(content, { type: 'string' });
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('El archivo Excel está vacío o no tiene hojas');
    }

    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      throw new Error('No se pudo leer la hoja de cálculo');
    }

    // Convert to array of arrays with proper options
    const rows = utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false, // Convert everything to strings
      defval: '' // Default value for empty cells
    }) as string[][];

    // Filter out empty rows and normalize cell values
    return rows
      .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
      .map(row => 
        row.map(cell => 
          cell === null || cell === undefined ? '' : String(cell).trim()
        )
      );
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Error al procesar el archivo Excel. Verifique que el archivo tenga el formato correcto y no esté dañado.');
  }
}
export function parseCSVLine(line: string): string[] {
  // Skip empty lines
  if (!line.trim()) {
    return [];
  }

  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ("") inside quoted values
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if ((char === ';' || char === ',') && !insideQuotes) {
      // End of field - handle both semicolon and comma separators
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  // Remove any empty trailing fields
  while (values.length > 0 && !values[values.length - 1]) {
    values.pop();
  }
  
  return values;
}

export function parseCSVContent(content: string): string[][] {
  // Handle UTF-8 BOM and different line endings
  const cleanContent = content
    .replace(/^\uFEFF/, '') // Remove BOM if present
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n');
    
  // Split into lines and filter out empty ones
  const lines = cleanContent
    .split('\n')
    .filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('El archivo está vacío');
  }

  // Parse each line
  return lines.map((line, index) => {
    try {
      const values = parseCSVLine(line);
      if (values.length === 0) {
        throw new Error('Línea vacía');
      }
      return values;
    } catch (error) {
      throw new Error(`Error en la línea ${index + 1}: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    }
  });
}
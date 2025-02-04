// Client-side stock check service
export async function authenticateZureo(): Promise<boolean> {
  try {
    const response = await fetch('https://scraper-production-9c05.up.railway.app/auth');
    if (!response.ok) {
      throw new Error('Error de autenticación');
    }
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

export async function getZureoStock(articleCode: string): Promise<number | null> {
  try {
    // Validate article code
    if (!articleCode?.trim()) {
      throw new Error('Código de artículo inválido');
    }

    const response = await fetch(`https://scraper-production-9c05.up.railway.app/stock/${articleCode}`, {
      // Add headers to help with error handling
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      let errorMessage = 'Error desconocido';
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Error desconocido';
        } else {
          const textError = await response.text();
          errorMessage = textError || response.statusText || 'Error desconocido';
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = response.statusText || 'Error de comunicación con el servidor';
      }

      // Handle specific status codes
      switch (response.status) {
        case 404:
          throw new Error(`No se encontró el artículo ${articleCode}`);
        case 500:
          throw new Error('El servidor no está disponible en este momento. Por favor, intente más tarde');
        case 502:
        case 503:
        case 504:
          throw new Error('Servicio temporalmente no disponible. Por favor, intente más tarde');
        case 401:
        case 403:
          throw new Error('Sesión expirada. Por favor, autentíquese nuevamente');
        default:
          throw new Error(`Error al consultar el stock: ${errorMessage}`);
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing success response:', parseError);
      throw new Error('Error al procesar la respuesta del servidor');
    }
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }

    if (!('stock' in data)) {
      throw new Error('La respuesta no contiene información de stock');
    }

    const stock = Number(data.stock);
    if (isNaN(stock)) {
      throw new Error('El valor de stock no es un número válido');
    }

    return stock;
  } catch (error) {
    // Create a structured error object with fallbacks for empty errors
    const errorInfo = {
      articleCode,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.name : 'UnknownError',
      details: error || 'No additional error details available',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    // Log the complete error information
    console.error('Error checking stock:', errorInfo);
    
    // Re-throw with a guaranteed message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error inesperado al consultar el stock');
    }
  }
}
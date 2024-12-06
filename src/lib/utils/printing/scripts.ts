export const printScripts = `
  let isPrinting = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

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

      window.onafterprint = () => {
        isPrinting = false;
        setTimeout(() => {
          window.close();
        }, 100);
      };

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

  window.onload = () => {
    try {
      setTimeout(handlePrint, 500);
    } catch (error) {
      console.error('Print error:', error);
      showError('Error al iniciar la impresión. Por favor, use el botón Imprimir.');
    }
  };

  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Print error:', { message, source, lineno, colno, error });
    showError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
    return false;
  };
`;
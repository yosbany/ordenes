export const printScripts = `
  let isPrinting = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  function createPrintIcon() {
    return \`
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    \`;
  }

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

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  function setupPrintButton() {
    const printButton = document.getElementById('print-button');
    if (printButton) {
      printButton.innerHTML = createPrintIcon() + 'Imprimir';
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

      // Timeout handler for print dialog
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
      setupPrintButton();
      // Delay initial print to ensure content is rendered
      setTimeout(handlePrint, 800);
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
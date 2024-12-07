export const thermalPrintStyles = `
  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Base styles */
  body {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    background: #f3f4f6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Preview Container */
  .content {
    width: 80mm;
    background: white;
    margin: 20px auto;
    padding: 10mm;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
  }

  .header {
    text-align: center;
    margin-bottom: 6mm;
    border-bottom: 1px dashed #000;
    padding-bottom: 4mm;
  }

  .header div {
    margin-bottom: 2mm;
    font-weight: bold;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4mm;
  }

  tr {
    border-bottom: 1px dotted #ccc;
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 2mm 1mm;
    font-size: 13px;
  }

  td.quantity {
    white-space: nowrap;
    padding-right: 3mm;
    width: 1%;
    font-weight: bold;
  }

  td.name {
    word-break: break-word;
  }

  /* Print Controls */
  .controls {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 100;
  }

  .print-button {
    padding: 12px 24px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .print-button:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .print-button:active {
    transform: translateY(0);
  }

  .print-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .print-button svg {
    width: 16px;
    height: 16px;
  }

  .error-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #fee2e2;
    color: #991b1b;
    padding: 12px 24px;
    border-radius: 6px;
    border: 1px solid #fecaca;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
    text-align: center;
    max-width: 90%;
    font-size: 14px;
  }

  /* Print Media Styles */
  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
      width: 80mm;
      margin: 0;
      padding: 0;
      background: white;
      min-height: auto;
    }

    .content {
      width: 100%;
      margin: 0;
      padding: 4mm;
      box-shadow: none;
      border-radius: 0;
    }

    .controls,
    .error-message {
      display: none !important;
    }

    tr {
      page-break-inside: avoid;
    }

    td {
      font-size: 12px;
    }
  }
`;
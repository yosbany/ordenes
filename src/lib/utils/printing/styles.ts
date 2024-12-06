export const thermalPrintStyles = `
  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Base styles */
  body {
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
    width: 80mm;
    margin: 0 auto;
    padding: 0;
    background: white;
  }

  .content {
    padding: 3mm;
  }

  .header {
    text-align: left;
    margin-bottom: 3mm;
    border-bottom: 1px dashed #000;
    padding-bottom: 3mm;
  }

  .header div {
    margin-bottom: 1mm;
    white-space: pre-wrap;
    word-break: break-word;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px dotted #ccc;
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 2mm 0;
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
  }

  .print-button {
    padding: 10px 20px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .print-button:hover {
    background: #1d4ed8;
  }

  .print-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
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
    }

    .controls,
    .error-message {
      display: none !important;
    }

    tr {
      page-break-inside: avoid;
    }
  }
`;
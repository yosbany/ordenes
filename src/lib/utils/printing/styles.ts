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
    font-size: 12px;
    line-height: 1.2;
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
    padding: 2mm;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
  }

  /* Header */
  .header {
    margin-bottom: 3mm;
    border-bottom: 1px dashed #000;
    padding-bottom: 2mm;
  }

  .header div {
    margin-bottom: 1mm;
    font-weight: bold;
  }

  /* Business Info - Larger */
  .header div:nth-child(1) {
    font-size: 14px;
  }

  /* Owner Info */
  .header div:nth-child(2) {
    font-size: 12px;
  }

  /* Date - Smaller */
  .header div:nth-child(3) {
    font-size: 10px;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2mm;
  }

  tr {
    border-bottom: none;
  }

  td {
    padding: 0.5mm 1mm;
    font-size: 12px;
    vertical-align: top;
  }

  td.quantity {
    white-space: nowrap;
    padding-right: 2mm;
    width: 1%;
    font-weight: bold;
  }

  td.name {
    word-break: break-word;
  }

  /* Summary Section */
  .summary {
    margin-top: 3mm;
    padding-top: 2mm;
    border-top: 1px dashed #000;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1mm;
    font-size: 12px;
  }

  .summary-label {
    font-weight: normal;
  }

  .summary-value {
    font-weight: bold;
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
      padding: 2mm;
      box-shadow: none;
      border-radius: 0;
    }

    .controls {
      display: none !important;
    }

    /* Print header styles */
    .header {
      margin-bottom: 3mm;
      padding-bottom: 2mm;
    }

    .header div:nth-child(1) {
      font-size: 14px;
      font-weight: bold;
    }

    .header div:nth-child(2) {
      font-size: 12px;
      font-weight: bold;
    }

    .header div:nth-child(3) {
      font-size: 10px;
    }

    /* Print table styles */
    table {
      margin: 2mm 0;
    }

    td {
      padding: 0.5mm 1mm;
      font-size: 12px;
    }

    td.quantity {
      font-weight: bold;
    }

    /* Print summary styles */
    .summary {
      margin-top: 3mm;
      padding-top: 2mm;
      border-top: 1px dashed #000;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1mm;
      font-size: 12px;
    }

    .summary-label {
      font-weight: normal;
    }

    .summary-value {
      font-weight: bold;
    }
  }
`;
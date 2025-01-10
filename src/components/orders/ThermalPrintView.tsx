import React from 'react';
import { Order, Product, Provider } from '@/types';
import { formatReport } from '@/lib/utils/formatting/reportUtils';

interface ThermalPrintViewProps {
  order: Order;
  products: Product[];
  provider: Provider;
}

export function ThermalPrintView({ order, products, provider }: ThermalPrintViewProps) {
  const content = formatReport(order, products, false);
  const totalItems = order.items.length;
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="font-mono text-sm" style={{ width: '80mm', margin: '0 auto' }}>
      <style>
        {`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              width: 80mm;
              margin: 0;
              padding: 8px;
              font-family: monospace;
              font-size: 12px;
              line-height: 1.2;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              font-family: inherit;
              font-size: inherit;
            }
          }
        `}
      </style>
      <pre className="whitespace-pre-wrap">{content}</pre>
      <div className="summary">
        <div className="summary-row">
          <span className="summary-label">Total Items:</span>
          <span>{totalItems}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Unidades:</span>
          <span>{totalUnits}</span>
        </div>
      </div>
    </div>
  );
}
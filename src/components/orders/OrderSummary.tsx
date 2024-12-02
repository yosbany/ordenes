import React from 'react';
import { Order, Product, Provider } from '@/types';
import { formatReport } from '@/lib/utils/formatting/reportUtils';

interface OrderSummaryProps {
  order: Order;
  products: Product[];
  provider: Provider;
  preview?: boolean;
}

export function OrderSummary({ order, products, provider, preview = true }: OrderSummaryProps) {
  const report = formatReport(order, products, preview);
  
  // For WhatsApp preview, replace markdown bold syntax with HTML
  const formattedReport = preview
    ? report.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    : report;

  return (
    <div 
      className={`
        font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto
        ${preview ? '' : 'print:p-0 print:bg-white'}
      `}
      style={{ width: preview ? 'auto' : '80mm' }}
    >
      <pre
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: formattedReport }}
      />
    </div>
  );
}
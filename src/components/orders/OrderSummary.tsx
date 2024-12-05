import React from 'react';
import { Order, Product, Provider } from '@/types';
import { formatReport } from '@/lib/utils/formatting/reportUtils';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  order: Order;
  products: Product[];
  provider: Provider;
  preview?: boolean;
}

export function OrderSummary({ order, products, provider, preview = true }: OrderSummaryProps) {
  // Sort items by product order
  const sortedItems = [...order.items].sort((a, b) => {
    const productA = products.find(p => p.id === a.productId);
    const productB = products.find(p => p.id === b.productId);
    if (!productA || !productB) return 0;
    return productA.order - productB.order;
  });

  // Get formatted report
  const report = formatReport(order, products, preview);

  // For preview (modals, etc), use the monospace font and preserve formatting
  return (
    <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
      {report}
    </div>
  );
}
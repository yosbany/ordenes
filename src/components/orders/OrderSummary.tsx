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

  if (preview) {
    // For preview (modals, etc), use the standard report format
    const report = formatReport(order, products, preview);
    const formattedReport = preview
      ? report.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      : report;

    return (
      <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
        <pre
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formattedReport }}
        />
      </div>
    );
  }

  // For detailed view (print, full page), use a more styled layout
  return (
    <div className="space-y-4 print:space-y-2">
      {/* Products Table */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 print:border-gray-300">
              <th className="text-left py-3 font-medium text-gray-600 print:py-2">Producto</th>
              <th className="text-right py-3 font-medium text-gray-600 print:py-2">Cantidad</th>
              <th className="text-right py-3 font-medium text-gray-600 print:py-2">Precio</th>
              <th className="text-right py-3 font-medium text-gray-600 print:py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 print:divide-gray-300">
            {sortedItems.map((item) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="py-3 print:py-2">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.sku && (
                      <div className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</div>
                    )}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap print:py-2">
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                    <span className="text-gray-500 ml-1">{product.purchasePackaging}</span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap print:py-2 text-gray-600">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap print:py-2 font-medium text-gray-900">
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 print:border-gray-300 font-medium">
              <td colSpan={3} className="py-3 text-right print:py-2">Total:</td>
              <td className="py-3 text-right print:py-2 text-lg text-blue-600">
                {formatPrice(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
import React from 'react';
import { Order, Product, Provider } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ThermalPrintViewProps {
  order: Order;
  products: Product[];
  provider: Provider;
}

export function ThermalPrintView({ order, products, provider }: ThermalPrintViewProps) {
  // Calculate total products
  const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="font-mono text-sm w-[302px] p-4" style={{ width: '80mm' }}>
      <style>
        {`
          @media print {
            body {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div className="text-center border-b pb-2 mb-2">
        <div className="font-bold">{provider.commercialName}</div>
        {provider.legalName && provider.legalName !== provider.commercialName && (
          <div className="text-xs">{provider.legalName}</div>
        )}
        <div className="text-xs mt-1">
          {format(new Date(order.date), "dd/MM/yyyy HH:mm", { locale: es })}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 border-b pb-2 mb-2">
        {order.items
          .sort((a, b) => {
            const productA = products.find(p => p.id === a.productId);
            const productB = products.find(p => p.id === b.productId);
            if (!productA || !productB) return 0;
            return productA.order - productB.order;
          })
          .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="flex justify-between">
                <div className="flex-1">{product.name}</div>
                <div className="ml-4 text-right">
                  {item.quantity} {product.purchasePackaging}
                </div>
              </div>
            );
          })}
      </div>

      {/* Total Products */}
      <div className="text-right font-bold">
        Total productos: {totalProducts}
      </div>
    </div>
  );
}
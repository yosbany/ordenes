import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { ProviderSelector } from '@/components/ui/ProviderSelector';
import { useProviders } from '@/hooks/useProviders';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { OrderList } from '@/components/orders/OrderList';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { OrderListSearch } from '@/components/orders/OrderListSearch';
import { FullscreenOrderEditor } from '@/components/orders/FullscreenOrderEditor';
import { Order } from '@/types';
import { createOrder } from '@/lib/order/calculations';
import { validateOrder } from '@/lib/order/validation';

interface ViewingOrderInfo {
  order: Order;
  orderNumber: number;
}

export function Orders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { providers } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const { orders, loading, addOrder, updateOrder } = useOrders(selectedProviderId);
  const { products, updateProduct } = useProducts(selectedProviderId);
  const { orders: allOrders, loading: globalOrdersLoading } = useGlobalOrders();
  const { products: allProducts, loading: globalProductsLoading } = useGlobalProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<ViewingOrderInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [shouldReturnToDashboard, setShouldReturnToDashboard] = useState(false);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // Get last 5 orders
  const recentOrders = allOrders
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Handle URL parameters and today's order
  useEffect(() => {
    const providerId = searchParams.get('provider');
    const isNewOrder = searchParams.get('new') === 'true';
    
    if (providerId) {
      setSelectedProviderId(providerId);
      
      // If coming from dashboard
      if (isNewOrder) {
        setIsFormOpen(true);
        setShouldReturnToDashboard(true);
      } else {
        // Find today's order for this provider
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));
        
        const todayOrder = orders.find(order => {
          const orderDate = new Date(order.date);
          return orderDate >= todayStart && orderDate <= todayEnd;
        });

        if (todayOrder) {
          // Initialize selected products from today's order
          const initialProducts = new Map();
          todayOrder.items.forEach(item => {
            initialProducts.set(item.productId, item.quantity);
          });
          setSelectedProducts(initialProducts);
          setSelectedOrder(todayOrder);
          setIsFormOpen(true);
          setShouldReturnToDashboard(true);
        }
      }
      
      // Clean up URL parameters
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, orders]);

  const handleProductSelect = (productId: string, quantity: number) => {
    const newSelected = new Map(selectedProducts);
    if (quantity > 0) {
      newSelected.set(productId, quantity);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSubmit = async () => {
    if (!selectedProviderId || !products || !selectedProvider) {
      toast.error('Seleccione un proveedor');
      return;
    }

    if (selectedProducts.size === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = createOrder(selectedProviderId, selectedProducts, products);
      
      // Validate order before saving
      const validationError = validateOrder(orderData, products);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      if (selectedOrder) {
        await updateOrder(selectedOrder.id!, orderData);
        toast.success('Orden actualizada exitosamente');
      } else {
        await addOrder(orderData);
        toast.success('Orden creada exitosamente');
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedOrder(null);
    setSelectedProducts(new Map());
    
    // If we came from dashboard, go back
    if (shouldReturnToDashboard) {
      navigate('/');
    }
  };

  const handleSelectOrder = (order: Order, orderNumber: number) => {
    // Set provider ID if not already set
    if (!selectedProviderId) {
      setSelectedProviderId(order.providerId);
    }

    if (order.status === 'completed') {
      setViewingOrder({ order, orderNumber });
    } else {
      const initialProducts = new Map();
      order.items.forEach(item => {
        initialProducts.set(item.productId, item.quantity);
      });
      setSelectedProducts(initialProducts);
      setSelectedOrder(order);
      setIsFormOpen(true);
    }
  };

  const handleEditOrder = () => {
    if (!viewingOrder) return;

    const initialProducts = new Map();
    viewingOrder.order.items.forEach(item => {
      initialProducts.set(item.productId, item.quantity);
    });
    setSelectedProducts(initialProducts);
    setSelectedOrder(viewingOrder.order);
    setViewingOrder(null);
    setIsFormOpen(true);
  };

  const isLoading = loading || globalOrdersLoading || globalProductsLoading;

  return (
    <div className="space-y-4">
      {/* Global Order Search */}
      <OrderListSearch
        orders={allOrders}
        products={allProducts}
        onOrderSelect={handleSelectOrder}
      />

      {/* Provider Selection and Actions */}
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <ProviderSelector
              providers={providers}
              selectedProviderId={selectedProviderId}
              onChange={setSelectedProviderId}
            />
          </div>

          {selectedProviderId && (
            <div className="flex-shrink-0 w-full md:w-auto">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white h-[48px] px-6 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="whitespace-nowrap">Nueva Orden</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Recent Orders (when no provider selected) */}
          {!selectedProviderId && recentOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Últimas Órdenes</h2>
              <OrderList
                orders={recentOrders}
                products={allProducts}
                onSelect={handleSelectOrder}
              />
            </div>
          )}

          {isFormOpen && selectedProvider && (
            <FullscreenOrderEditor
              products={products}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              onProductUpdate={updateProduct}
              onConfirm={handleSubmit}
              onCancel={handleCloseForm}
              isSubmitting={isSubmitting}
              provider={selectedProvider}
            />
          )}

          {viewingOrder && selectedProvider && (
            <OrderDetails
              order={viewingOrder.order}
              orderNumber={viewingOrder.orderNumber}
              products={allProducts}
              provider={selectedProvider}
              onClose={() => setViewingOrder(null)}
              onEdit={handleEditOrder}
            />
          )}

          {!isFormOpen && !viewingOrder && selectedProviderId && (
            <OrderList
              orders={orders}
              products={products}
              provider={selectedProvider}
              onSelect={handleSelectOrder}
            />
          )}
        </>
      )}
    </div>
  );
}
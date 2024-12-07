import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProviders } from '@/hooks/useProviders';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useGlobalOrders } from '@/hooks/useGlobalOrders';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { OrderList } from '@/components/orders/OrderList';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { OrderListSearch } from '@/components/orders/OrderListSearch';
import { FullscreenOrderEditor } from '@/components/orders/FullscreenOrderEditor';
import { Order, Product } from '@/types';
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
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useOrders(selectedProviderId);
  const { products, updateProduct } = useProducts(selectedProviderId);
  const { orders: globalOrders, loading: globalOrdersLoading } = useGlobalOrders();
  const { products: globalProducts, loading: globalProductsLoading } = useGlobalProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<ViewingOrderInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [shouldReturnToDashboard, setShouldReturnToDashboard] = useState(false);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // Get last 5 orders
  const recentOrders = globalOrders
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
      toast.error('Ocurrió un error al guardar la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id!);
      toast.success('Orden eliminada exitosamente');
      setOrderToDelete(null);
    } catch (error) {
      toast.error('Ocurrió un error al eliminar la orden');
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

    const initialProducts = new Map();
    order.items.forEach(item => {
      initialProducts.set(item.productId, item.quantity);
    });
    setSelectedProducts(initialProducts);
    setSelectedOrder(order);
    setIsFormOpen(true);
  };

  const handleViewDetails = (order: Order, orderNumber: number) => {
    setViewingOrder({ order, orderNumber });
  };

  const providerOptions = providers.map(provider => ({
    value: provider.id!,
    label: provider.commercialName
  }));

  const isLoading = loading || globalOrdersLoading || globalProductsLoading;

  return (
    <div className="space-y-6">
      {/* Global Order Search */}
      <OrderListSearch
        orders={globalOrders}
        products={globalProducts}
        onOrderSelect={handleSelectOrder}
      />

      {/* Provider Selection and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 max-w-xs">
          <SearchableSelect
            options={providerOptions}
            value={selectedProviderId}
            onChange={setSelectedProviderId}
            placeholder="Seleccionar Proveedor"
          />
        </div>

        {selectedProviderId && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        )}
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
                products={globalProducts}
                provider={selectedProvider}
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
              products={globalProducts}
              provider={selectedProvider}
              onClose={() => setViewingOrder(null)}
            />
          )}
          {!isFormOpen && !viewingOrder && selectedProviderId && (
            <OrderList
              orders={orders}
              products={products}
              provider={selectedProvider}
              onSelect={handleSelectOrder}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}

      <Dialog
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        title="Eliminar orden"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar esta orden?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOrderToDelete(null)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
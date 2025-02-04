import { makeAutoObservable } from 'mobx';
import { Order } from '@/core/domain/entities';
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { CreateOrderUseCase } from '@/core/application/useCases/orders/CreateOrderUseCase';
import { ILogger } from '@/core/domain/logging/ILogger';
import { toast } from 'react-hot-toast';

export class OrderViewModel {
  orders: Order[] = [];
  loading = true;
  selectedProviderId = '';
  selectedProducts = new Map<string, number>();
  error: string | null = null;

  constructor(
    private orderRepository: IOrderRepository,
    private createOrderUseCase: CreateOrderUseCase,
    private logger: ILogger
  ) {
    makeAutoObservable(this);
  }

  setSelectedProviderId(id: string) {
    this.selectedProviderId = id;
    this.logger.debug('Selected provider changed', { providerId: id });
    this.loadOrders();
  }

  async loadOrders() {
    if (!this.selectedProviderId) {
      this.orders = [];
      this.loading = false;
      return;
    }

    try {
      this.loading = true;
      this.error = null;
      this.logger.info('Loading orders', { providerId: this.selectedProviderId });
      
      const orders = await this.orderRepository.getByProvider(this.selectedProviderId);
      this.orders = orders;
      
      this.logger.debug('Orders loaded successfully', { 
        providerId: this.selectedProviderId,
        count: orders.length 
      });
    } catch (error) {
      this.error = 'Error al cargar las órdenes';
      this.logger.error('Failed to load orders', error as Error, { 
        providerId: this.selectedProviderId 
      });
      toast.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  setSelectedProducts(products: Map<string, number>) {
    this.selectedProducts = products;
    this.logger.debug('Selected products updated', {
      count: products.size,
      products: Array.from(products.entries())
    });
  }

  async createOrder(order: Omit<Order, 'id'>) {
    try {
      this.error = null;
      this.logger.info('Creating new order', { 
        providerId: order.providerId,
        itemsCount: order.items.length,
        total: order.total
      });

      const orderId = await this.createOrderUseCase.execute(order);
      
      this.logger.info('Order created successfully', { orderId });
      toast.success('Orden creada exitosamente');
      return orderId;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Error al crear la orden';
      this.logger.error('Failed to create order', error as Error, { order });
      toast.error(this.error);
      throw error;
    }
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    try {
      this.error = null;
      this.logger.info('Updating order', { orderId: id, updates });

      await this.orderRepository.update(id, updates);
      
      this.logger.info('Order updated successfully', { orderId: id });
      toast.success('Orden actualizada exitosamente');
    } catch (error) {
      this.error = 'Error al actualizar la orden';
      this.logger.error('Failed to update order', error as Error, { 
        orderId: id, 
        updates 
      });
      toast.error(this.error);
      throw error;
    }
  }

  async deleteOrder(id: string) {
    try {
      this.error = null;
      this.logger.info('Deleting order', { orderId: id });

      await this.orderRepository.delete(id);
      
      this.logger.info('Order deleted successfully', { orderId: id });
      toast.success('Orden eliminada exitosamente');
    } catch (error) {
      this.error = 'Error al eliminar la orden';
      this.logger.error('Failed to delete order', error as Error, { orderId: id });
      toast.error(this.error);
      throw error;
    }
  }
}
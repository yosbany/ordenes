import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProviders } from '@/hooks/useProviders';
import { Card } from '@/components/ui/Card';
import { Package, Calendar, Users, BarChart2, TrendingUp, RepeatIcon } from 'lucide-react';
import { WeekDay } from '@/types';
import { useTodayOrdersCount } from '@/hooks/useTodayOrdersCount';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { TopProductsModal } from '@/components/dashboard/TopProductsModal';
import { ProviderOrderStatus } from '@/components/dashboard/ProviderOrderStatus';
import { ProviderDeliveryStatus } from '@/components/dashboard/ProviderDeliveryStatus';

const WEEKDAY_MAP: Record<string, WeekDay> = {
  'lunes': 'monday',
  'martes': 'tuesday',
  'miércoles': 'wednesday',
  'jueves': 'thursday',
  'viernes': 'friday',
  'sábado': 'saturday',
  'domingo': 'sunday'
};

export function Dashboard() {
  const { providers } = useProviders();
  const today = new Date();
  const currentDayName = WEEKDAY_MAP[format(today, 'EEEE', { locale: es })];
  const { count: todayOrdersCount, loading: ordersLoading } = useTodayOrdersCount(providers);
  const { weeklyOrders, topProducts, productFrequency, loading: analyticsLoading } = useAnalytics();
  const [isTopProductsModalOpen, setIsTopProductsModalOpen] = useState(false);
  
  // Filter providers that have orders scheduled for today
  const providersForOrder = providers.filter(p => 
    p.orderDays?.includes(currentDayName)
  );

  // Get weekly orders total
  const totalWeeklyOrders = weeklyOrders[0]?.count || 0;

  // Get most ordered product
  const topProduct = topProducts[0];

  // Get most frequent product
  const mostFrequentProduct = productFrequency[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <Card.Header className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Proveedores</p>
                <h3 className="text-2xl font-bold mt-1">{providers.length}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card.Header>
        </Card>

        <Card>
          <Card.Header className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
                <h3 className="text-2xl font-bold mt-1">
                  {ordersLoading ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    todayOrdersCount
                  )}
                </h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card.Header>
        </Card>

        <Card>
          <Card.Header className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold capitalize">
                  {format(today, 'EEEE', { locale: es })}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {format(today, 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card.Header>
        </Card>

        <AnalyticsCard
          title="Órdenes Semanales"
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
          loading={analyticsLoading}
        >
          <h3 className="text-2xl font-bold mt-1">{totalWeeklyOrders}</h3>
        </AnalyticsCard>

        <AnalyticsCard
          title="Producto Más Comprado"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          loading={analyticsLoading}
          className="lg:col-span-2 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsTopProductsModalOpen(true)}
        >
          {topProduct && (
            <div className="mt-1">
              <h3 className="text-lg font-bold break-words">{topProduct.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {topProduct.totalQuantity} unidades en {topProduct.orderCount} órdenes
              </p>
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Producto Más Frecuente"
          icon={<RepeatIcon className="w-5 h-5 text-indigo-600" />}
          loading={analyticsLoading}
          className="lg:col-span-2"
        >
          {mostFrequentProduct && (
            <div className="mt-1">
              <h3 className="text-lg font-bold break-words">{mostFrequentProduct.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Pedido {mostFrequentProduct.frequency} veces
              </p>
            </div>
          )}
        </AnalyticsCard>
      </div>

      {/* Daily Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders Section */}
        <Card>
          <Card.Header>
            <Card.Title>Hoy se deben realizar pedidos a:</Card.Title>
          </Card.Header>
          <Card.Content>
            {providersForOrder.length > 0 ? (
              <ul className="divide-y">
                {providersForOrder.map(provider => (
                  <ProviderOrderStatus 
                    key={provider.id} 
                    provider={provider}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-3">
                No hay pedidos programados para hoy
              </p>
            )}
          </Card.Content>
        </Card>

        {/* Deliveries Section */}
        <Card>
          <Card.Header>
            <Card.Title>Hoy se deben recibir pedidos de:</Card.Title>
          </Card.Header>
          <Card.Content>
            {providersForOrder.length > 0 ? (
              <ul className="divide-y">
                {providersForOrder.map(provider => (
                  <ProviderDeliveryStatus 
                    key={provider.id} 
                    provider={provider}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-3">
                No hay entregas programadas para hoy
              </p>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Top Products Modal */}
      <TopProductsModal
        isOpen={isTopProductsModalOpen}
        onClose={() => setIsTopProductsModalOpen(false)}
        products={topProducts}
      />
    </div>
  );
}
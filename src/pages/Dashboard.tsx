import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { 
  Package, 
  Calendar, 
  Users, 
  BarChart2, 
  TrendingUp, 
  Archive, 
  ShoppingCart,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDashboardViewModel } from '@/presentation/hooks/useViewModel';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { TopProductsModal } from '@/components/dashboard/TopProductsModal';
import { TopProductsByTags } from '@/components/dashboard/TopProductsByTags';
import { TagProductsCard } from '@/components/dashboard/TagProductsCard';
import { CsvImportCard } from '@/components/dashboard/CsvImportCard';
import { formatPrice } from '@/lib/utils';

export const Dashboard = observer(() => {
  const viewModel = useDashboardViewModel();
  const [isTopProductsModalOpen, setIsTopProductsModalOpen] = useState(false);
  const [isTopProductsByTagsModalOpen, setIsTopProductsByTagsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await viewModel.loadStats();
    setIsRefreshing(false);
  };

  const topProduct = viewModel.topProducts[0];

  return (
    <div className="space-y-6">
      {/* Header con botón de actualización */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={viewModel.loading || isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Date Card */}
        <Card>
          <Card.Header className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold capitalize">
                  {format(new Date(), 'EEEE', { locale: es })}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {format(new Date(), 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card.Header>
        </Card>

        {/* Total Products Card */}
        <AnalyticsCard
          title="Total Productos"
          icon={<Archive className="w-5 h-5 text-indigo-600" />}
          loading={viewModel.loading}
        >
          <h3 className="text-2xl font-bold mt-1">{viewModel.totalProducts}</h3>
        </AnalyticsCard>

        {/* Total Providers Card */}
        <AnalyticsCard
          title="Total Proveedores"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          loading={viewModel.loading}
        >
          <h3 className="text-2xl font-bold mt-1">{viewModel.totalProviders}</h3>
        </AnalyticsCard>

        {/* Total Orders Card */}
        <AnalyticsCard
          title="Total Órdenes"
          icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
          loading={viewModel.loading}
        >
          <h3 className="text-2xl font-bold mt-1">{viewModel.totalOrders}</h3>
        </AnalyticsCard>

        {/* Today's Orders Card */}
        <Card>
          <Card.Header className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
                <h3 className="text-2xl font-bold mt-1">
                  {viewModel.loading ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    viewModel.todayOrdersCount
                  )}
                </h3>
                <div className="text-sm text-gray-500 mt-1">
                  {formatPrice(viewModel.todayOrdersAmount)}
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card.Header>
        </Card>

        {/* Weekly Orders Card */}
        <AnalyticsCard
          title="Órdenes Semanales"
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
          loading={viewModel.loading}
        >
          <h3 className="text-2xl font-bold mt-1">{viewModel.weekOrdersCount}</h3>
          <div className="text-sm text-gray-500 mt-1">
            {formatPrice(viewModel.weekOrdersAmount)}
          </div>
        </AnalyticsCard>

        {/* Most Valuable Product Card */}
        <AnalyticsCard
          title="Producto Más Valorado"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          loading={viewModel.loading}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsTopProductsModalOpen(true)}
        >
          {topProduct && (
            <div className="mt-1">
              <h3 className="text-lg font-bold break-words">
                {topProduct.name}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(topProduct.totalAmount)}
                </span>
                <span className="text-sm text-gray-500">
                  {topProduct.totalQuantity} unidades
                </span>
              </div>
            </div>
          )}
        </AnalyticsCard>

        {/* Tag Products Card */}
        <TagProductsCard
          tagStats={viewModel.topProductsByTags}
          loading={viewModel.loading}
          onClick={() => setIsTopProductsByTagsModalOpen(true)}
        />

        {/* CSV Import Card */}
        <CsvImportCard />
      </div>

      {/* Modals */}
      <TopProductsModal
        isOpen={isTopProductsModalOpen}
        onClose={() => setIsTopProductsModalOpen(false)}
        products={viewModel.topProducts}
      />

      <TopProductsByTags
        isOpen={isTopProductsByTagsModalOpen}
        onClose={() => setIsTopProductsByTagsModalOpen(false)}
        tagStats={viewModel.topProductsByTags}
      />

      {/* Last Update Info */}
      {viewModel.formattedLastUpdate && (
        <div className="text-center text-sm text-gray-500">
          Última actualización: {viewModel.formattedLastUpdate}
          {viewModel.isStale && (
            <span className="text-amber-500 ml-2">
              (Datos desactualizados)
            </span>
          )}
        </div>
      )}
    </div>
  );
});
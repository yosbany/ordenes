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
  RefreshCw,
  FileText,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDashboardViewModel } from '@/presentation/hooks/useViewModel';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { TopProductsModal } from '@/components/dashboard/TopProductsModal';
import { TopProductsByTags } from '@/components/dashboard/TopProductsByTags';
import { TagProductsCard } from '@/components/dashboard/TagProductsCard';
import { CsvImportCard } from '@/components/dashboard/CsvImportCard';
import { RecipesCard } from '@/components/dashboard/RecipesCard';
import { UnitManagementModal } from '@/components/dashboard/UnitManagementModal';
import { formatPrice } from '@/lib/utils';

const Dashboard = observer(() => {
  const viewModel = useDashboardViewModel();
  const [isTopProductsModalOpen, setIsTopProductsModalOpen] = useState(false);
  const [isTopProductsByTagsModalOpen, setIsTopProductsByTagsModalOpen] = useState(false);
  const [isUnitManagementOpen, setIsUnitManagementOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await viewModel.loadStats();
    setIsRefreshing(false);
  };

  const topProduct = viewModel.topProducts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {viewModel.formattedLastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {viewModel.formattedLastUpdate}
              {viewModel.isStale && (
                <span className="text-amber-500 ml-2">
                  (Datos desactualizados)
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUnitManagementOpen(true)}
            className="gap-2 flex-1 sm:flex-none"
          >
            <Scale className="w-4 h-4" />
            <span className="whitespace-nowrap">Unidades</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={viewModel.loading || isRefreshing}
            className="gap-2 flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Card */}
          <Card variant="blue">
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Today's Orders Card */}
          <Card variant="purple">
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
          <Card variant="indigo">
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Órdenes Semanales</p>
                  <h3 className="text-2xl font-bold mt-1">{viewModel.weekOrdersCount}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(viewModel.weekOrdersAmount)}
                  </div>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Monthly Orders Card */}
          <Card variant="amber">
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Órdenes Mensuales</p>
                  <h3 className="text-2xl font-bold mt-1">{viewModel.monthOrdersCount}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(viewModel.monthOrdersAmount)}
                  </div>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </Card.Header>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Products Card */}
          <Card variant="indigo">
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <h3 className="text-2xl font-bold mt-1">{viewModel.totalProducts}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    En catálogo
                  </div>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Archive className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Total Providers Card */}
          <Card variant="emerald">
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Proveedores</p>
                  <h3 className="text-2xl font-bold mt-1">{viewModel.totalProviders}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Activos
                  </div>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Total Orders Card */}
          <Card variant="rose">
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                  <h3 className="text-2xl font-bold mt-1">{viewModel.totalOrders}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Históricas
                  </div>
                </div>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </Card.Header>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Most Valuable Product Card */}
          <Card 
            variant="green" 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setIsTopProductsModalOpen(true)}
          >
            <Card.Header className="!p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    Productos Más Valorados
                  </h3>
                </div>
              </div>
              {topProduct && (
                <div>
                  <h4 className="text-xl font-bold break-words">
                    {topProduct.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(topProduct.totalAmount)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {topProduct.totalQuantity} unidades
                    </span>
                  </div>
                </div>
              )}
            </Card.Header>
          </Card>

          {/* CSV Import Card */}
          <CsvImportCard />

          {/* Recipes Card */}
          <RecipesCard />
        </div>

        {/* Tag Products Card */}
        <TagProductsCard
          tagStats={viewModel.topProductsByTags}
          loading={viewModel.loading}
          onClick={() => setIsTopProductsByTagsModalOpen(true)}
        />
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

      <UnitManagementModal
        isOpen={isUnitManagementOpen}
        onClose={() => setIsUnitManagementOpen(false)}
      />
    </div>
  );
});

export default Dashboard;

export { Dashboard }
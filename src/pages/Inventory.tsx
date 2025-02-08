import React, { useState, useMemo } from 'react';
import { Package, Search, LogIn, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { StockControl } from '@/components/inventory/StockControl';
import { StockReport } from '@/components/inventory/StockReport';
import { authenticateZureo } from '@/lib/services/zureo/stockCheck';
import { toast } from 'react-hot-toast';
import { Product } from '@/types';

interface ProductGroup {
  sku: string;
  products: Product[];
  stockAdjustments: Product['stockAdjustments'];
  lastStockCheck: number | null;
}

export function Inventory() {
  const { products, loading, updateProduct } = useGlobalProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [maxReportDate, setMaxReportDate] = useState<Date | null>(new Date());

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      const success = await authenticateZureo();
      setIsAuthenticated(success);
      if (success) {
        toast.success('Autenticación exitosa');
      } else {
        toast.error('Error de autenticación');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Error de autenticación');
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Group products by SKU
  const productGroups = useMemo(() => {
    const productsWithSku = products.filter(p => p.sku?.trim());

    const groups = productsWithSku.reduce((acc, product) => {
      const sku = product.sku.trim().toUpperCase();
      if (!acc[sku]) {
        acc[sku] = {
          sku,
          products: [],
          stockAdjustments: product.stockAdjustments || [],
          lastStockCheck: product.lastStockCheck || null
        };
      }
      acc[sku].products.push(product);
      if (product.lastStockCheck && (!acc[sku].lastStockCheck || product.lastStockCheck > acc[sku].lastStockCheck)) {
        acc[sku].stockAdjustments = product.stockAdjustments || [];
        acc[sku].lastStockCheck = product.lastStockCheck;
      }
      return acc;
    }, {} as Record<string, ProductGroup>);

    return Object.values(groups)
      .filter(group => 
        !searchTerm || 
        group.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.products.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
      .sort((a, b) => {
        if (!a.lastStockCheck && !b.lastStockCheck) return 0;
        if (!a.lastStockCheck) return 1;
        if (!b.lastStockCheck) return -1;
        return b.lastStockCheck - a.lastStockCheck;
      });
  }, [products, searchTerm]);

  const handleStockAdjustment = async (sku: string, adjustment: number) => {
    try {
      const updates = productGroups
        .find(g => g.sku === sku)
        ?.products.map(product => 
          updateProduct(product.id!, {
            stockAdjustments: [
              ...(product.stockAdjustments || []),
              {
                date: Date.now(),
                quantity: adjustment
              }
            ],
            lastStockCheck: Date.now()
          })
        ) || [];

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  // Prepare report data
  const reportData = productGroups.map(group => ({
    sku: group.sku,
    names: group.products.map(p => p.name),
    stockAdjustments: group.stockAdjustments || [],
    packaging: group.products[0].salePackaging || group.products[0].purchasePackaging
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Control de Inventario</h1>
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowReport(true)}
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="whitespace-nowrap">Ver Reporte</span>
            </Button>
            <Button
              onClick={handleAuthenticate}
              isLoading={isAuthenticating}
              variant={isAuthenticated ? "outline" : "default"}
              className="w-full sm:w-auto gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {isAuthenticated ? 'Autenticado' : 'Autenticar'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      {!showReport && (
        <div className="relative">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Products Grid or Report */}
      {showReport ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="w-full sm:max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mostrar ajustes desde:
              </label>
              <input
                type="date"
                value={maxReportDate ? maxReportDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setMaxReportDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <StockReport
            data={reportData}
            maxDate={maxReportDate}
            onClose={() => setShowReport(false)}
          />
        </>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productGroups.map((group) => {
            const daysSinceCheck = group.lastStockCheck
              ? Math.floor((Date.now() - group.lastStockCheck) / (1000 * 60 * 60 * 24))
              : null;

            // Calculate total adjustments
            const totalAdjustments = group.stockAdjustments?.reduce((sum, adj) => sum + adj.quantity, 0) || 0;

            return (
              <div
                key={group.sku}
                className={`bg-white p-4 rounded-lg border shadow-sm space-y-4 ${
                  !group.lastStockCheck ? 'border-amber-300 bg-amber-50' :
                  daysSinceCheck && daysSinceCheck > 30 ? 'border-yellow-200 bg-yellow-50' :
                  ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">SKU: {group.sku}</h3>
                    <span className="text-sm text-gray-500">
                      {group.products.length} {group.products.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {group.products.map((product) => (
                      <p 
                        key={product.id} 
                        className={`text-sm ${
                          group.products.length > 1 
                            ? 'text-xs leading-tight' 
                            : 'text-base'
                        } text-gray-600`}
                      >
                        {product.name}
                      </p>
                    ))}
                  </div>

                  {group.products[0].tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.products[0].tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Último Ajuste:</span>
                    <p className="font-medium text-gray-900">
                      {totalAdjustments > 0 ? (
                        <span className="text-green-600">+{totalAdjustments}</span>
                      ) : totalAdjustments < 0 ? (
                        <span className="text-red-600">{totalAdjustments}</span>
                      ) : (
                        <span>0</span>
                      )}
                      {' '}{group.products[0].salePackaging || group.products[0].purchasePackaging}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Último Control:</span>
                    <p className={`font-medium ${
                      !group.lastStockCheck ? 'text-amber-700' :
                      daysSinceCheck && daysSinceCheck > 30 ? 'text-yellow-700' :
                      'text-gray-900'
                    }`}>
                      {group.lastStockCheck ? (
                        <>
                          {new Date(group.lastStockCheck).toLocaleDateString()}
                          <span className="block text-xs text-gray-500">
                            Hace {daysSinceCheck} días
                          </span>
                        </>
                      ) : (
                        'Nunca'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <StockControl
                    productId={group.products[0].id!}
                    sku={group.sku}
                    onStockAdjustment={(adjustment) => handleStockAdjustment(group.sku, adjustment)}
                    isEnabled={isAuthenticated}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
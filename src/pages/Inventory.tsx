import React, { useState, useMemo } from 'react';
import { Package, Search, LogIn, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';
import { StockControl } from '@/components/inventory/StockControl';
import { StockReport } from '@/components/inventory/StockReport';
import { formatPrice } from '@/lib/utils';
import { authenticateZureo } from '@/lib/services/zureo/stockCheck';
import { toast } from 'react-hot-toast';
import { Product } from '@/types';

interface ProductGroup {
  sku: string;
  products: Product[];
  currentStock: number;
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
    // Filter out products without SKU
    const productsWithSku = products.filter(p => p.sku?.trim());

    // Group by SKU
    const groups = productsWithSku.reduce((acc, product) => {
      const sku = product.sku.trim().toUpperCase();
      if (!acc[sku]) {
        acc[sku] = {
          sku,
          products: [],
          currentStock: product.currentStock || 0,
          lastStockCheck: product.lastStockCheck || null
        };
      }
      acc[sku].products.push(product);
      // Update group stock if this product has a more recent check
      if (product.lastStockCheck && (!acc[sku].lastStockCheck || product.lastStockCheck > acc[sku].lastStockCheck)) {
        acc[sku].currentStock = product.currentStock || 0;
        acc[sku].lastStockCheck = product.lastStockCheck;
      }
      return acc;
    }, {} as Record<string, ProductGroup>);

    // Convert to array and sort
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
        // Products never checked go first
        if (!a.lastStockCheck && !b.lastStockCheck) return 0;
        if (!a.lastStockCheck) return -1;
        if (!b.lastStockCheck) return 1;
        
        // Then sort by date (oldest first)
        return a.lastStockCheck - b.lastStockCheck;
      });
  }, [products, searchTerm]);

  const handleStockUpdate = async (sku: string, newStock: number) => {
    try {
      // Update all products with this SKU
      const updates = productGroups
        .find(g => g.sku === sku)
        ?.products.map(product => 
          updateProduct(product.id!, {
            currentStock: newStock,
            lastStockCheck: Date.now()
          })
        ) || [];

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const handleShowReport = () => {
    setShowReport(true);
  };

  // Prepare report data
  const reportData = productGroups.map(group => ({
    sku: group.sku,
    names: group.products.map(p => p.name),
    currentStock: group.currentStock,
    lastStockCheck: group.lastStockCheck,
    packaging: group.products[0].salePackaging || group.products[0].purchasePackaging
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Control de Inventario</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleShowReport}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Ver Reporte
          </Button>
          <Button
            onClick={handleAuthenticate}
            isLoading={isAuthenticating}
            variant={isAuthenticated ? "outline" : "default"}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isAuthenticated ? 'Autenticado' : 'Autenticar en Zureo'}
          </Button>
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
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mostrar controles desde:
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
            // Calculate days since last check
            const daysSinceCheck = group.lastStockCheck
              ? Math.floor((Date.now() - group.lastStockCheck) / (1000 * 60 * 60 * 24))
              : null;

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
                    <span className="text-gray-500">Stock Actual:</span>
                    <p className="font-medium text-gray-900">
                      {group.currentStock} {group.products[0].salePackaging || group.products[0].purchasePackaging}
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
                    currentStock={group.currentStock}
                    onStockUpdate={(newStock) => handleStockUpdate(group.sku, newStock)}
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
import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ProviderSelector } from '@/components/ui/ProviderSelector';
import { useProviders } from '@/hooks/useProviders';
import { useProducts } from '@/hooks/useProducts';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { AdvancedFilters } from '@/components/products/AdvancedFilters';
import { FullscreenProductForm } from '@/components/products/FullscreenProductForm';
import { Product } from '@/types';
import { SECTORS } from '@/config/constants';
import { calculateNewOrder, getSectorFromOrder } from '@/lib/order/utils';
import { useGlobalProducts } from '@/hooks/useGlobalProducts';

// Define initial filters state
const initialFilters = {
  terms: '',
  margin: 'all',
  price: 'all',
  codes: 'all',
  isProduction: false,
  forSale: false,
  enabled: 'all',
  sortBy: 'updated',
  sortDirection: 'asc'
} as const;

export function Products() {
  const { providers } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const { products: providerProducts, loading: providerLoading, addProduct, updateProduct, deleteProduct } = useProducts(selectedProviderId);
  const { products: allProducts, loading: allProductsLoading } = useGlobalProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Get base products to display
  const baseProducts = allProducts;

  // Calculate number of active filters
  const getActiveFiltersCount = (filters: typeof initialFilters) => {
    let count = 0;
    if (filters.terms) count++;
    if (filters.margin !== 'all') count++;
    if (filters.price !== 'all') count++;
    if (filters.codes !== 'all') count++;
    if (filters.isProduction) count++;
    if (filters.forSale) count++;
    if (filters.enabled !== 'all') count++;
    if (filters.sortBy !== 'updated' || filters.sortDirection !== 'asc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount(currentFilters);

  // Apply filters when provider changes
  useEffect(() => {
    if (!providerLoading && !allProductsLoading) {
      applyCurrentFilters();
    }
  }, [selectedProviderId, providerLoading, allProductsLoading]);

  const applyCurrentFilters = useCallback(() => {
    let filtered = [...baseProducts];

    // Apply provider filter first
    if (selectedProviderId) {
      filtered = filtered.filter(p => p.providerId === selectedProviderId);
    }

    // Apply text search filter
    if (currentFilters.terms) {
      const searchLower = currentFilters.terms.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.supplierCode?.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply margin filter
    if (currentFilters.margin !== 'all') {
      filtered = filtered.filter(p => {
        const margin = p.forSale && p.salePrice && p.saleCostPerUnit
          ? ((p.salePrice - p.saleCostPerUnit) / p.salePrice) * 100
          : null;
        
        switch (currentFilters.margin) {
          case 'red':
            return margin !== null && margin < 0;
          case 'orange':
            return margin !== null && margin >= 0 && margin <= 5;
          case 'green':
            return margin !== null && margin > 5;
          default:
            return true;
        }
      });
    }

    // Apply price filter
    if (currentFilters.price === 'no-purchase') {
      filtered = filtered.filter(p => !p.price || p.price === 0 || p.price === null);
    } else if (currentFilters.price === 'no-sale') {
      filtered = filtered.filter(p => p.forSale && (!p.salePrice || p.salePrice <= 0));
    }

    // Apply type filters
    if (currentFilters.isProduction) {
      filtered = filtered.filter(p => p.isProduction);
    }
    if (currentFilters.forSale) {
      filtered = filtered.filter(p => p.forSale);
    }

    // Apply enabled state filter
    if (currentFilters.enabled !== 'all') {
      filtered = filtered.filter(p => 
        currentFilters.enabled === 'enabled' 
          ? p.enabled !== false 
          : p.enabled === false
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = currentFilters.sortDirection === 'asc' ? 1 : -1;
      
      switch (currentFilters.sortBy) {
        case 'updated':
          return ((a.lastUpdated || 0) - (b.lastUpdated || 0)) * direction;
        case 'margin': {
          const marginA = a.forSale && a.salePrice && a.saleCostPerUnit
            ? ((a.salePrice - a.saleCostPerUnit) / a.salePrice) * 100
            : -Infinity;
          const marginB = b.forSale && b.salePrice && b.saleCostPerUnit
            ? ((b.salePrice - b.saleCostPerUnit) / b.salePrice) * 100
            : -Infinity;
          return (marginA - marginB) * direction;
        }
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'price':
          return ((a.price || 0) - (b.price || 0)) * direction;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setHasAppliedFilters(true);
  }, [baseProducts, currentFilters, selectedProviderId]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProviderId(providerId);
    // Reset filters when changing provider
    setCurrentFilters(initialFilters);
    setHasAppliedFilters(false);
  };

  const handleApplyFilters = useCallback((filters: typeof initialFilters, _products: Product[]) => {
    setCurrentFilters(filters);
    applyCurrentFilters();
  }, [applyCurrentFilters]);

  const handleClearFilters = useCallback(() => {
    setCurrentFilters(initialFilters);
    setHasAppliedFilters(false);
    applyCurrentFilters();
  }, [applyCurrentFilters]);

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, data);
        handleCloseForm();
      } else {
        const defaultSector = SECTORS[0].code;
        const sectorProducts = baseProducts.filter(p => getSectorFromOrder(p.order) === defaultSector);
        const newOrder = calculateNewOrder(defaultSector, sectorProducts.length + 1);
        
        await addProduct({ ...data, order: newOrder });
        handleCloseForm();
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id!);
      setProductToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleNewProduct = () => {
    if (!selectedProviderId) {
      toast.error('Seleccione un proveedor primero');
      return;
    }

    if (editingProduct) {
      const dialog = Dialog({
        isOpen: true,
        onClose: () => {},
        title: "Advertencia",
        children: (
          <div className="space-y-4">
            <p className="text-amber-600">
              Hay un producto en edición. ¿Desea descartar los cambios y crear uno nuevo?
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => dialog.close()}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                  dialog.close();
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        ),
      });
    } else {
      setIsFormOpen(true);
    }
  };

  // Render fullscreen form outside of the main content
  if (isFormOpen) {
    return (
      <FullscreenProductForm
        providerId={editingProduct?.providerId || selectedProviderId}
        initialData={editingProduct || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCloseForm}
        isLoading={isSubmitting}
      />
    );
  }

  const isLoading = providerLoading || allProductsLoading;
  const displayProducts = hasAppliedFilters ? filteredProducts : (selectedProviderId ? providerProducts : allProducts);

  return (
    <div className="space-y-6">
      {/* Provider Selection and New Product Button */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <ProviderSelector
                providers={providers}
                selectedProviderId={selectedProviderId}
                onChange={handleProviderChange}
              />
            </div>
            <div className="relative">
              <Button
                variant={showAdvancedFilters ? "primary" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-[48px] w-[48px] flex items-center justify-center flex-shrink-0 ${
                  activeFiltersCount > 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : ''
                }`}
                title="Filtros avanzados"
              >
                <Filter className="w-5 h-5" />
              </Button>
              {activeFiltersCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded-full">
                  {activeFiltersCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProviderId && (
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              onClick={handleNewProduct}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white h-[48px] px-6 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="whitespace-nowrap">Nuevo Producto</span>
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
          <AdvancedFilters
            products={baseProducts}
            onFilter={handleApplyFilters}
            onClear={handleClearFilters}
            onClose={() => setShowAdvancedFilters(false)}
            initialFilters={currentFilters}
            onUpdateFilters={setCurrentFilters}
          />
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : displayProducts.length > 0 ? (
        <ProductCarousel
          products={displayProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6">
          {hasAppliedFilters ? (
            <>
              <p className="text-gray-500 text-center mb-4">
                No se encontraron productos que coincidan con los filtros aplicados
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Limpiar filtros
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              {selectedProviderId 
                ? 'No hay productos para este proveedor'
                : 'Seleccione un proveedor para ver sus productos'
              }
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Eliminar producto"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar el producto "{productToDelete?.name}"?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
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
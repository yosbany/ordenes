import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ProviderSelector } from '@/components/ui/ProviderSelector';
import { useProviders } from '@/hooks/useProviders';
import { useProducts } from '@/hooks/useProducts';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { GlobalProductSearch } from '@/components/products/GlobalProductSearch';
import { ProviderProductSearch } from '@/components/products/ProviderProductSearch';
import { FullscreenProductForm } from '@/components/products/FullscreenProductForm';
import { Product } from '@/types';
import { SECTORS } from '@/config/constants';
import { calculateNewOrder, getSectorFromOrder } from '@/lib/order/utils';

export function Products() {
  const { providers } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts(selectedProviderId);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, {
          ...data,
          id: editingProduct.id
        });
        toast.success('Producto actualizado exitosamente');
      } else {
        const defaultSector = SECTORS[0].code;
        const sectorProducts = products.filter(p => getSectorFromOrder(p.order) === defaultSector);
        const newOrder = calculateNewOrder(defaultSector, sectorProducts.length + 1);
        
        await addProduct({ ...data, order: newOrder });
        toast.success('Producto creado exitosamente');
      }
      handleCloseForm();
    } catch (error) {
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
      toast.success('Producto eliminado exitosamente');
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
    if (editingProduct) {
      const dialog = Dialog({
        isOpen: true,
        onClose: () => {},
        title: "Advertencia",
        children: (
          <div className="space-y-4">
            <p className="text-amber-600">
              Hay un producto en edición. ¿Desea cancelar los cambios y crear uno nuevo?
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

  const handleFilter = useCallback((filtered: Product[], isActiveFilter: boolean) => {
    setFilteredProducts(filtered);
    setIsFiltering(isActiveFilter);
  }, []);

  return (
    <div className="space-y-6">
      {/* Global Product Search */}
      <GlobalProductSearch onProductSelect={handleEdit} />

      {/* Provider Selection and New Product Button */}
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
                onClick={handleNewProduct}
                className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white h-[48px] px-6 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="whitespace-nowrap">Nuevo Producto</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Product Form */}
      {isFormOpen && (
        <FullscreenProductForm
          providerId={editingProduct?.providerId || selectedProviderId}
          initialData={editingProduct || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      )}

      {/* Main Content */}
      {selectedProviderId ? (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          !isFormOpen && (
            <>
              <ProviderProductSearch
                products={products}
                onFilter={handleFilter}
              />
              {(!isFiltering || filteredProducts.length > 0) ? (
                <ProductCarousel
                  products={isFiltering ? filteredProducts : products}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  providerId={selectedProviderId}
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-center px-4">
                    No se encontraron productos que coincidan con la búsqueda
                  </p>
                </div>
              )}
            </>
          )
        )
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center px-4">
            Seleccione un proveedor para ver sus productos
          </p>
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